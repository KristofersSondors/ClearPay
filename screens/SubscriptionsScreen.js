import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { getManualSubscriptions } from "../src/lib/manualSubscriptions";
import {
  getDetectedBankSubscriptions,
  getLinkedBanks,
} from "../src/lib/bankingApi";
import { getSupabaseClient, hasSupabaseConfig } from "../src/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mergeSubscriptions } from "../src/lib/transactionMetrics";

const LOCAL_BANKING_USER_ID_KEY = "clearpay_local_banking_user_id";

export default function SubscriptionsScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [bankSubscriptions, setBankSubscriptions] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [isNameFilterOpen, setIsNameFilterOpen] = useState(false);
  const [nameFilterSearch, setNameFilterSearch] = useState("");

  const resolveUserId = async () => {
    if (hasSupabaseConfig) {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        return data.user.id;
      }
    }

    return await AsyncStorage.getItem(LOCAL_BANKING_USER_ID_KEY);
  };

  useEffect(() => {
    const loadSubscriptions = async () => {
      const stored = await getManualSubscriptions();
      setSubscriptions(stored);

      // Load bank-detected subscriptions
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
    };

    loadSubscriptions();
    const unsubscribe = navigation.addListener("focus", loadSubscriptions);

    return unsubscribe;
  }, [navigation]);

  const normalizedSubscriptions = useMemo(() => {
    // Merge manual and bank subscriptions
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

      return {
        id: item.id,
        name: item.name,
        category: item.source === "bank" ? "Bank Detected" : "Manual",
        amount: Number(item.amountValue || 0).toFixed(2),
        currency: item.currency || "USD",
        freq: item.frequency || "Monthly",
        nextPaymentIso: item.nextPaymentIso || "",
        emoji: item.source === "bank" ? "🏦" : "🧾",
        color: item.source === "bank" ? "#1E40AF" : "#5B3FD9",
        nextPaymentDate,
        source: item.source,
      };
    });
  }, [subscriptions, bankSubscriptions]);

  const subscriptionNames = useMemo(() => {
    const names = [];
    const seen = new Set();

    normalizedSubscriptions.forEach((item) => {
      const key = item.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        names.push(item.name);
      }
    });

    return names;
  }, [normalizedSubscriptions]);

  const filtered = normalizedSubscriptions.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesName =
      !selectedName || s.name.toLowerCase() === selectedName.toLowerCase();

    return matchesSearch && matchesName;
  });

  const filteredNameOptions = useMemo(() => {
    return subscriptionNames.filter((name) =>
      name.toLowerCase().includes(nameFilterSearch.toLowerCase()),
    );
  }, [subscriptionNames, nameFilterSearch]);

  const selectedNameLabel = selectedName || "All subscriptions";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.pageTitle}>Subscriptions</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Subscriptions</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {subscriptionNames.length > 0 && (
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={styles.filterSelector}
              onPress={() => setIsNameFilterOpen(true)}
            >
              <Text style={styles.filterSelectorLabel}>Filter by name</Text>
              <Text style={styles.filterSelectorValue} numberOfLines={1}>
                {selectedNameLabel}
              </Text>
            </TouchableOpacity>
            {selectedName ? (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => setSelectedName("")}
              >
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>

      <Modal
        visible={isNameFilterOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setIsNameFilterOpen(false);
          setNameFilterSearch("");
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setIsNameFilterOpen(false);
            setNameFilterSearch("");
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalCard}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>Select Subscription Name</Text>
            <View style={styles.modalSearchBox}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search names..."
                placeholderTextColor="#aaa"
                value={nameFilterSearch}
                onChangeText={setNameFilterSearch}
              />
            </View>

            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedName("");
                  setIsNameFilterOpen(false);
                  setNameFilterSearch("");
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    !selectedName ? styles.modalItemTextActive : null,
                  ]}
                >
                  All subscriptions
                </Text>
              </TouchableOpacity>

              {filteredNameOptions.map((name) => {
                const isSelected =
                  selectedName.toLowerCase() === name.toLowerCase();
                return (
                  <TouchableOpacity
                    key={name}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedName(name);
                      setIsNameFilterOpen(false);
                      setNameFilterSearch("");
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected ? styles.modalItemTextActive : null,
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No subscriptions found</Text>
          <Text style={styles.emptySub}>
            Add one from the + button in the header.
          </Text>
        </View>
      ) : (
        filtered.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            style={styles.subRow}
            onPress={() => navigation.navigate("SubscriptionDetail", { sub })}
          >
            <View
              style={[styles.subIcon, { backgroundColor: sub.color + "22" }]}
            >
              <Text style={{ fontSize: 22 }}>{sub.emoji}</Text>
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
  searchIcon: { marginRight: 6, fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#1a1a1a" },
  filterBar: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  filterSelector: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  filterSelectorLabel: {
    fontSize: 11,
    color: "#777",
    marginBottom: 2,
  },
  filterSelectorValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5B3FD9",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: "65%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  modalSearchBox: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalSearchInput: {
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a1a1a",
  },
  modalList: {
    maxHeight: 280,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  modalItemText: {
    fontSize: 14,
    color: "#333",
  },
  modalItemTextActive: {
    color: "#5B3FD9",
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
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
  subIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subName: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  subCat: { fontSize: 12, color: "#888", marginTop: 2 },
  subAmount: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  subFreq: { fontSize: 12, color: "#888", marginTop: 2 },
  chevron: { fontSize: 20, color: "#ccc", marginLeft: 8 },
});
