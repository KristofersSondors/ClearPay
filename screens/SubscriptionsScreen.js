import React, { useMemo, useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  PanResponder,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SubscriptionLogo from "../src/components/SubscriptionLogo";
import { getManualSubscriptions } from "../src/lib/manualSubscriptions";
import {
  getDetectedBankSubscriptions,
  getLinkedBanks,
} from "../src/lib/bankingApi";
import { getSupabaseClient, hasSupabaseConfig } from "../src/lib/supabase";
import AsyncStorage from "../src/lib/asyncStorage";
import { mergeSubscriptions } from "../src/lib/transactionMetrics";
import {
  getSubscriptionLogoOverrides,
  resolveLogoDomainForSubscription,
} from "../src/lib/subscriptionLogoOverrides";

const LOCAL_BANKING_USER_ID_KEY = "clearpay_local_banking_user_id";

function useSwipeToDismiss(onDismiss) {
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onDismiss();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return { translateY, panHandlers: panResponder.panHandlers };
}

const SORT_OPTIONS = [
  { key: "nextPayment", label: "Next payment (soonest)" },
  { key: "mostExpensiveMonthly", label: "Most expensive monthly" },
  { key: "cheapestMonthly", label: "Cheapest monthly" },
  { key: "mostExpensiveYearly", label: "Most expensive yearly" },
  { key: "cheapestYearly", label: "Cheapest yearly" },
  { key: "nameAZ", label: "Name A to Z" },
  { key: "nameZA", label: "Name Z to A" },
  { key: "recentlyAdded", label: "Recently added" },
];

const SOURCE_OPTIONS = [
  { key: "all", label: "All sources" },
  { key: "manual", label: "Manual" },
  { key: "bank", label: "Bank detected" },
];

const FREQ_OPTIONS = [
  { key: "all", label: "All frequencies" },
  { key: "Weekly", label: "Weekly" },
  { key: "Monthly", label: "Monthly" },
  { key: "Yearly", label: "Yearly" },
];

function toMonthlyAmount(amount, freq) {
  const n = Number(amount) || 0;
  if (freq === "Weekly") return (n * 52) / 12;
  if (freq === "Yearly") return n / 12;
  return n;
}

export default function SubscriptionsScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [bankSubscriptions, setBankSubscriptions] = useState([]);
  const [logoOverrides, setLogoOverrides] = useState({});

  // Sort & filter state
  const [sortKey, setSortKey] = useState("nextPayment");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [freqFilter, setFreqFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("");

  // Modal visibility
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [nameSearch, setNameSearch] = useState("");

  const sortSwipe = useSwipeToDismiss(() => setSortOpen(false));
  const filterSwipe = useSwipeToDismiss(() => {
    setFilterOpen(false);
    setNameSearch("");
  });

  const resolveUserId = async () => {
    if (hasSupabaseConfig) {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) return data.user.id;
    }
    return await AsyncStorage.getItem(LOCAL_BANKING_USER_ID_KEY);
  };

  const loadSubscriptions = useCallback(async () => {
    const stored = await getManualSubscriptions();
    setSubscriptions(stored);

    let overrides = {};
    try {
      overrides = await getSubscriptionLogoOverrides();
    } catch {
      overrides = {};
    }
    setLogoOverrides(overrides);

    try {
      const userId = await resolveUserId();
      if (userId) {
        const linked = await getLinkedBanks(userId);
        const linkedBankIds = Array.isArray(linked?.linkedBankIds)
          ? linked.linkedBankIds
          : [];
        if (linkedBankIds.length > 0) {
          const bankSubs = await getDetectedBankSubscriptions(userId);
          setBankSubscriptions(
            Array.isArray(bankSubs?.subscriptions)
              ? bankSubs.subscriptions
              : [],
          );
        } else {
          setBankSubscriptions([]);
        }
      }
    } catch {
      setBankSubscriptions([]);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadSubscriptions();
    }, [loadSubscriptions]),
  );

  const normalizedSubscriptions = useMemo(() => {
    const allSubs = mergeSubscriptions(subscriptions, bankSubscriptions);
    return allSubs.map((item) => {
      const nextDate = item.nextPaymentIso
        ? new Date(item.nextPaymentIso)
        : null;
      const nextPaymentDate =
        nextDate && !Number.isNaN(nextDate.getTime())
          ? nextDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A";

      const origAmount =
        item.amountValue !== undefined ? item.amountValue : item.amount || 0;
      const displayAmount = Number(origAmount).toFixed(2);
      const displayFreq = item.frequency || "Monthly";
      const monthly = toMonthlyAmount(origAmount, displayFreq);
      const yearly = monthly * 12;

      return {
        id: item.id,
        name: item.name,
        category: item.source === "bank" ? "Bank Detected" : "Manual",
        amount: displayAmount,
        currency: item.currency || "USD",
        freq: displayFreq,
        nextPaymentIso: item.nextPaymentIso || "",
        color: item.source === "bank" ? "#1E40AF" : "#5B3FD9",
        nextPaymentDate,
        source: item.source,
        logoDomain: resolveLogoDomainForSubscription(item, logoOverrides),
        monthly,
        yearly,
        createdAt: item.createdAt || "",
      };
    });
  }, [subscriptions, bankSubscriptions, logoOverrides]);

  // Unique names for the name filter picker
  const subscriptionNames = useMemo(() => {
    const seen = new Set();
    return normalizedSubscriptions
      .filter((s) => {
        const k = s.name.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .map((s) => s.name);
  }, [normalizedSubscriptions]);

  const filteredNameOptions = useMemo(
    () =>
      subscriptionNames.filter((n) =>
        n.toLowerCase().includes(nameSearch.toLowerCase()),
      ),
    [subscriptionNames, nameSearch],
  );

  // Count active filters (excluding sort)
  const activeFilterCount = [
    sourceFilter !== "all",
    freqFilter !== "all",
    !!nameFilter,
  ].filter(Boolean).length;

  const sortLabel =
    SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Sort";

  const processedList = useMemo(() => {
    let list = normalizedSubscriptions.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (sourceFilter !== "all" && s.source !== sourceFilter) return false;
      if (freqFilter !== "all" && s.freq !== freqFilter) return false;
      if (nameFilter && s.name.toLowerCase() !== nameFilter.toLowerCase())
        return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "mostExpensiveMonthly":
          return b.monthly - a.monthly;
        case "cheapestMonthly":
          return a.monthly - b.monthly;
        case "mostExpensiveYearly":
          return b.yearly - a.yearly;
        case "cheapestYearly":
          return a.yearly - b.yearly;
        case "nameAZ":
          return a.name.localeCompare(b.name);
        case "nameZA":
          return b.name.localeCompare(a.name);
        case "recentlyAdded":
          return b.createdAt > a.createdAt ? 1 : -1;
        case "nextPayment":
        default: {
          if (!a.nextPaymentIso && !b.nextPaymentIso) return 0;
          if (!a.nextPaymentIso) return 1;
          if (!b.nextPaymentIso) return -1;
          return new Date(a.nextPaymentIso) - new Date(b.nextPaymentIso);
        }
      }
    });

    return list;
  }, [
    normalizedSubscriptions,
    search,
    sortKey,
    sourceFilter,
    freqFilter,
    nameFilter,
  ]);

  const clearAllFilters = () => {
    setSourceFilter("all");
    setFreqFilter("all");
    setNameFilter("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.pageTitle}>Subscriptions</Text>

      {/* Search + controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Subscriptions</Text>

        {/* Search bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sort + Filter row */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              sortKey !== "nextPayment" && styles.controlBtnActive,
            ]}
            onPress={() => setSortOpen(true)}
          >
            <Text
              style={[
                styles.controlBtnText,
                sortKey !== "nextPayment" && styles.controlBtnTextActive,
              ]}
            >
              Sort
            </Text>
            <MaterialCommunityIcons
              name="sort"
              size={16}
              style={[
                styles.controlBtnIcon,
                sortKey !== "nextPayment" && styles.controlBtnTextActive,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlBtn,
              activeFilterCount > 0 && styles.controlBtnActive,
            ]}
            onPress={() => setFilterOpen(true)}
          >
            <Text
              style={[
                styles.controlBtnText,
                activeFilterCount > 0 && styles.controlBtnTextActive,
              ]}
            >
              Filter
            </Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
            <MaterialCommunityIcons
              name="filter-variant"
              size={16}
              style={[
                styles.controlBtnIcon,
                activeFilterCount > 0 && styles.controlBtnTextActive,
              ]}
            />
          </TouchableOpacity>

          {(sortKey !== "nextPayment" || activeFilterCount > 0) && (
            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={() => {
                setSortKey("nextPayment");
                clearAllFilters();
              }}
            >
              <Text style={styles.clearAllText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <View style={styles.chipRow}>
            {sourceFilter !== "all" && (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setSourceFilter("all")}
              >
                <Text style={styles.chipText}>
                  {SOURCE_OPTIONS.find((o) => o.key === sourceFilter)?.label}
                  {"  ✕"}
                </Text>
              </TouchableOpacity>
            )}
            {freqFilter !== "all" && (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setFreqFilter("all")}
              >
                <Text style={styles.chipText}>
                  {freqFilter}
                  {"  ✕"}
                </Text>
              </TouchableOpacity>
            )}
            {nameFilter && (
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setNameFilter("")}
              >
                <Text style={styles.chipText}>
                  {nameFilter}
                  {"  ✕"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sort summary label */}
        {sortKey !== "nextPayment" && (
          <Text style={styles.sortLabel}>Sorted by: {sortLabel}</Text>
        )}
      </View>

      {/* Results count */}
      {normalizedSubscriptions.length > 0 && (
        <Text style={styles.resultsCount}>
          {processedList.length} of {normalizedSubscriptions.length}{" "}
          subscriptions
        </Text>
      )}

      {/* List */}
      {processedList.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No subscriptions found</Text>
          <Text style={styles.emptySub}>
            {normalizedSubscriptions.length > 0
              ? "Try adjusting your filters."
              : "Add one from the + button in the header."}
          </Text>
        </View>
      ) : (
        processedList.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            style={styles.subRow}
            onPress={() => navigation.navigate("SubscriptionDetail", { sub })}
          >
            <View style={{ marginRight: 12 }}>
              <SubscriptionLogo
                name={sub.name}
                color={sub.color}
                logoDomain={sub.logoDomain}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subName}>{sub.name}</Text>
              <Text style={styles.subCat}>{sub.category}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={styles.subAmount}
              >{`${sub.currency} ${sub.amount}`}</Text>
              <Text style={styles.subFreq}>{sub.freq}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))
      )}

      {/* ── Sort bottom sheet ── */}
      <Modal
        visible={sortOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSortOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortOpen(false)}
        >
          <Animated.View
            style={[
              styles.modalCard,
              { transform: [{ translateY: sortSwipe.translateY }] },
            ]}
            {...sortSwipe.panHandlers}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Sort by</Text>
              {SORT_OPTIONS.map((opt) => {
                const active = sortKey === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.modalItem, active && styles.modalItemActive]}
                    onPress={() => {
                      setSortKey(opt.key);
                      setSortOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        active && styles.modalItemTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {active && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* ── Filter bottom sheet ── */}
      <Modal
        visible={filterOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setFilterOpen(false);
          setNameSearch("");
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setFilterOpen(false);
            setNameSearch("");
          }}
        >
          <Animated.View
            style={[
              styles.modalCard,
              {
                maxHeight: "80%",
                transform: [{ translateY: filterSwipe.translateY }],
              },
            ]}
            {...filterSwipe.panHandlers}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Filter</Text>
                {activeFilterCount > 0 && (
                  <TouchableOpacity onPress={clearAllFilters}>
                    <Text style={styles.clearFiltersLink}>Clear all</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Source */}
                <Text style={styles.filterGroupLabel}>Source</Text>
                <View style={styles.pillGroup}>
                  {SOURCE_OPTIONS.map((opt) => {
                    const active = sourceFilter === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[styles.pill, active && styles.pillActive]}
                        onPress={() => setSourceFilter(opt.key)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            active && styles.pillTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Frequency */}
                <Text style={styles.filterGroupLabel}>Frequency</Text>
                <View style={styles.pillGroup}>
                  {FREQ_OPTIONS.map((opt) => {
                    const active = freqFilter === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[styles.pill, active && styles.pillActive]}
                        onPress={() => setFreqFilter(opt.key)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            active && styles.pillTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Name */}
                <Text style={styles.filterGroupLabel}>Subscription name</Text>
                <View style={styles.modalSearchBox}>
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Search names..."
                    placeholderTextColor="#aaa"
                    value={nameSearch}
                    onChangeText={setNameSearch}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    !nameFilter && styles.modalItemActive,
                  ]}
                  onPress={() => setNameFilter("")}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      !nameFilter && styles.modalItemTextActive,
                    ]}
                  >
                    All subscriptions
                  </Text>
                  {!nameFilter && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                {filteredNameOptions.map((name) => {
                  const active =
                    nameFilter.toLowerCase() === name.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={name}
                      style={[
                        styles.modalItem,
                        active && styles.modalItemActive,
                      ]}
                      onPress={() => {
                        setNameFilter(name);
                        setNameSearch("");
                      }}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          active && styles.modalItemTextActive,
                        ]}
                      >
                        {name}
                      </Text>
                      {active && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => {
                  setFilterOpen(false);
                  setNameSearch("");
                }}
              >
                <Text style={styles.applyBtnText}>
                  Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: { marginRight: 6, fontSize: 16, color: "#aaa" },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#1a1a1a" },
  clearSearch: { fontSize: 13, color: "#aaa", paddingHorizontal: 4 },

  controlRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  controlBtnActive: { borderColor: "#5B3FD9", backgroundColor: "#F0EEFF" },
  controlBtnText: { fontSize: 13, fontWeight: "500", color: "#444" },
  controlBtnTextActive: { color: "#5B3FD9" },
  controlBtnChevron: { fontSize: 11, color: "#888" },
  controlBtnIcon: { color: "#888", marginLeft: 6 },
  filterBadge: {
    backgroundColor: "#5B3FD9",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  clearAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  clearAllText: { fontSize: 12, color: "#888", fontWeight: "500" },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: {
    backgroundColor: "#F0EEFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#DDD6F7",
  },
  chipText: { fontSize: 12, color: "#5B3FD9", fontWeight: "500" },

  sortLabel: { fontSize: 11, color: "#9B8EC4", marginTop: 8 },

  resultsCount: { fontSize: 12, color: "#888", marginBottom: 8, marginLeft: 2 },

  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  emptySub: { fontSize: 12, color: "#888", marginTop: 4 },

  subRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subName: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  subCat: { fontSize: 12, color: "#888", marginTop: 2 },
  subAmount: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  subFreq: { fontSize: 12, color: "#888", marginTop: 2 },
  chevron: { fontSize: 20, color: "#ccc", marginLeft: 8 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#1a1a1a" },
  clearFiltersLink: { fontSize: 13, color: "#5B3FD9", fontWeight: "600" },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  modalItemActive: { backgroundColor: "#FAFAFF" },
  modalItemText: { fontSize: 14, color: "#333" },
  modalItemTextActive: { color: "#5B3FD9", fontWeight: "600" },
  checkmark: { fontSize: 14, color: "#5B3FD9", fontWeight: "700" },

  filterGroupLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.4,
    marginTop: 16,
    marginBottom: 8,
  },
  pillGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillActive: { borderColor: "#5B3FD9", backgroundColor: "#F0EEFF" },
  pillText: { fontSize: 13, color: "#444" },
  pillTextActive: { color: "#5B3FD9", fontWeight: "600" },

  modalSearchBox: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  modalSearchInput: { paddingVertical: 10, fontSize: 14, color: "#1a1a1a" },

  applyBtn: {
    backgroundColor: "#5B3FD9",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 16,
  },
  applyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
