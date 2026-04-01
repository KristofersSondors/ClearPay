import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "../src/lib/asyncStorage";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAuthenticatedProfile,
  getSupabaseClient,
  hasSupabaseConfig,
} from "../src/lib/supabase";
import {
  getPreferredCurrency,
  getCurrencyPreferenceLabel,
} from "../src/lib/currencyPreferences";
import {
  getBackendHealthUrl,
  getBankProviders,
  getLinkedBanks,
  startBankLink,
  removeLinkedBank,
} from "../src/lib/bankingApi";

WebBrowser.maybeCompleteAuthSession();

const LOCAL_BANKING_USER_ID_KEY = "clearpay_local_banking_user_id";

const COUNTRY_NAMES = {
  SE: "Sweden",
  FI: "Finland",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  DE: "Germany",
  AT: "Austria",
  BE: "Belgium",
  BG: "Bulgaria",
  HR: "Croatia",
  CY: "Cyprus",
  CZ: "Czechia",
  DK: "Denmark",
  GR: "Greece",
  ES: "Spain",
  FR: "France",
  GB: "United Kingdom",
  HU: "Hungary",
  IE: "Ireland",
  IT: "Italy",
  NL: "Netherlands",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  SI: "Slovenia",
  SK: "Slovakia",
};

export default function SettingsScreen({ navigation }) {
  const [banks, setBanks] = useState([]);
  const [connected, setConnected] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [linkingBankId, setLinkingBankId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [showAddBankMode, setShowAddBankMode] = useState(false);
  const [profile, setProfile] = useState({
    name: "Your Profile",
    email: "Sign in to load your account",
    plan: "Free Plan",
    avatarUrl: "",
  });
  const [profileError, setProfileError] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const appRedirectUrl = "clearpay://bank/callback";

  const resolveCurrentUserId = async () => {
    if (hasSupabaseConfig) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user?.id) {
        return data.user.id;
      }
    }

    const existing = await AsyncStorage.getItem(LOCAL_BANKING_USER_ID_KEY);
    if (existing) {
      return existing;
    }

    const generated = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await AsyncStorage.setItem(LOCAL_BANKING_USER_ID_KEY, generated);
    return generated;
  };

  const loadLinkedBanks = async (userId) => {
    const linkedResponse = await getLinkedBanks(userId);
    setConnected(
      Array.isArray(linkedResponse?.linkedBankIds)
        ? linkedResponse.linkedBankIds
        : [],
    );
  };

  const loadBankProviders = async () => {
    const response = await getBankProviders();
    const providers = Array.isArray(response?.providers)
      ? response.providers
      : [];
    setBanks(providers);
  };

  const handleBankConnect = async (bank) => {
    if (!currentUserId || linkingBankId) {
      return;
    }

    try {
      setLinkingBankId(bank.id);

      const { authorizationUrl } = await startBankLink({
        userId: currentUserId,
        bankId: bank.id,
        appRedirectUrl,
        aspsp: bank.aspsp,
      });

      const authResult = await WebBrowser.openAuthSessionAsync(
        authorizationUrl,
        appRedirectUrl,
      );

      if (authResult.type === "success") {
        await loadLinkedBanks(currentUserId);
      }
    } catch (error) {
      Alert.alert("Bank linking failed", error?.message || "Please try again.");
    } finally {
      setLinkingBankId("");
    }
  };

  const handleBankDisconnect = async (bank) => {
    if (!currentUserId || !connected.includes(bank.id)) {
      return;
    }

    try {
      await removeLinkedBank(currentUserId, bank.id);
      setConnected(connected.filter((bankId) => bankId !== bank.id));
    } catch (error) {
      Alert.alert(
        "Bank unlinking failed",
        error?.message || "Please try again.",
      );
    }
  };

  const handleRemoveBank = async (bankId) => {
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Are you sure you want to unlink this bank?")
        : await new Promise((resolve) =>
            Alert.alert(
              "Remove Bank",
              "Are you sure you want to unlink this bank?",
              [
                { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                { text: "Remove", style: "destructive", onPress: () => resolve(true) },
              ],
            ),
          );
    if (!confirmed) return;
    try {
      await removeLinkedBank(currentUserId, bankId);
      await loadLinkedBanks(currentUserId);
      Alert.alert("Bank removed", "The bank has been unlinked.");
    } catch (error) {
      Alert.alert(
        "Failed to remove bank",
        error.message || "Please try again.",
      );
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const preferred = await getPreferredCurrency();
      setPreferredCurrency(preferred);

      if (!hasSupabaseConfig) {
        setProfileError("Supabase is not configured.");
        return;
      }

      const { profile: authenticatedProfile, error } =
        await getAuthenticatedProfile();

      if (error) {
        setProfileError(
          error.message || "Unable to load your account details.",
        );
        return;
      }

      if (!authenticatedProfile) {
        setProfileError("No authenticated user was found.");
        return;
      }

      setProfile(authenticatedProfile);
      setAvatarLoadFailed(false);
      setProfileError("");
    };

    const loadBanks = async () => {
      try {
        setLoadingBanks(true);
        const userId = await resolveCurrentUserId();
        setCurrentUserId(userId);
        await loadBankProviders();
        await loadLinkedBanks(userId);
      } catch {
        Alert.alert(
          "Banking service unavailable",
          `Make sure backend is running (${getBackendHealthUrl()}).`,
        );
      } finally {
        setLoadingBanks(false);
      }
    };

    loadProfile();
    loadBanks();

    const unsubscribe = navigation.addListener("focus", () => {
      loadProfile();
      loadBanks();
    });

    return unsubscribe;
  }, [navigation]);

  const handleSignOut = async () => {
    if (!hasSupabaseConfig) {
      navigation.replace("Welcome");
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Sign out failed", error.message || "Please try again.");
      return;
    }

    navigation.replace("Welcome");
  };

  // Search and filter logic
  const filteredBanks = useMemo(() => {
    // If showing add bank mode, show all banks (optional: exclude already connected)
    const banksToFilter = showAddBankMode
      ? banks
      : banks.filter((bank) => connected.includes(bank.id));

    if (!searchQuery.trim()) {
      return banksToFilter;
    }
    const query = searchQuery.toLowerCase();
    return banksToFilter.filter((bank) => {
      const countryName = COUNTRY_NAMES[bank.country] || bank.country;
      return (
        bank.name.toLowerCase().includes(query) ||
        bank.country.toLowerCase().includes(query) ||
        countryName.toLowerCase().includes(query)
      );
    });
  }, [banks, searchQuery, connected, showAddBankMode]);

  // Group banks by name for separator logic
  const banksByName = useMemo(() => {
    const grouped = {};
    filteredBanks.forEach((bank) => {
      if (!grouped[bank.name]) {
        grouped[bank.name] = [];
      }
      grouped[bank.name].push(bank);
    });
    return grouped;
  }, [filteredBanks]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {profile.avatarUrl && !avatarLoadFailed ? (
                <Image
                  key={profile.avatarUrl}
                  source={{ uri: profile.avatarUrl }}
                  style={styles.avatarImage}
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <Ionicons name="person-outline" size={28} color="#888" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planText}>{profile.plan}</Text>
              </View>
            </View>
          </View>
          {profileError ? (
            <Text style={styles.profileError}>{profileError}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Connected Banks */}
        <Text style={styles.sectionLabel}>Connected Banks</Text>
        <View style={styles.card}>
          {!showAddBankMode ? (
            <>
              <Text style={styles.bankDesc}>
                Link your bank accounts to automatically detect subscriptions
                and recurring payments. We use bank-level 256-bit encryption.
              </Text>

              {loadingBanks ? (
                <View style={styles.loadingBanksWrap}>
                  <ActivityIndicator size="small" color="#5B3FD9" />
                  <Text style={styles.loadingBanksText}>
                    Loading bank links...
                  </Text>
                </View>
              ) : null}

              {!loadingBanks && connected.length === 0 ? (
                <View style={styles.noBanksContainerSettings}>
                  <Text style={styles.noBanksText}>No banks connected yet</Text>
                </View>
              ) : (
                Object.entries(banksByName).map(([name, banksWithSameName]) => (
                  <View key={name}>
                    {banksWithSameName.length > 1 && (
                      <Text style={styles.bankNameSeparator}>{name}</Text>
                    )}
                    {banksWithSameName.map((bank) => {
                      const isConnected = connected.includes(bank.id);
                      const isLinking = linkingBankId === bank.id;
                      const showCountry = banksWithSameName.length > 1;
                      const countryDisplay =
                        COUNTRY_NAMES[bank.country] || bank.country;

                      return (
                        <TouchableOpacity
                          key={bank.id}
                          style={[
                            styles.bankRow,
                            isConnected && styles.bankRowConnected,
                          ]}
                          onPress={() =>
                            !isConnected && handleBankConnect(bank)
                          }
                          disabled={
                            loadingBanks ||
                            Boolean(linkingBankId)
                          }
                        >
                          <View style={styles.bankNameContainer}>
                            <Text style={[styles.bankName, { color: "#111" }]}>
                              {showCountry
                                ? `${bank.name} (${bank.country})`
                                : bank.name}
                            </Text>
                            {showCountry && (
                              <Text style={styles.bankCountrySubtitle}>
                                {countryDisplay}
                              </Text>
                            )}
                          </View>
                          {isConnected ? (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <View style={styles.connectedBadge}>
                                <Text style={styles.connectedText}>
                                  ✓ Connected
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.removeBankBtn}
                                onPress={() => handleRemoveBank(bank.id)}
                              >
                                <Text style={styles.removeBankText}>
                                  Remove
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <Text style={styles.connectText}>
                              {isLinking ? "Connecting..." : "Connect"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))
              )}

              {/* Add Bank Button: show "+ Add Bank" if none connected, else "+ Add Another Bank" */}
              <TouchableOpacity
                style={styles.addBankBtn}
                onPress={() => {
                  setShowAddBankMode(true);
                  setSearchQuery("");
                }}
              >
                <Text style={styles.addBankBtnText}>
                  {connected.length === 0 ? "+ Add Bank" : "+ Add Another Bank"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Back button for add bank mode */}
              <TouchableOpacity
                style={styles.backFromAddBankBtn}
                onPress={() => {
                  setShowAddBankMode(false);
                  setSearchQuery("");
                }}
              >
                <Text style={styles.backFromAddBankBtnText}>
                  ← Back to Connected Banks
                </Text>
              </TouchableOpacity>

              {/* Search input in add mode */}
              <View style={styles.searchContainerSettings}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search banks by name or country..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.searchClearBtn}
                    onPress={() => setSearchQuery("")}
                  >
                    <Text style={styles.searchClearText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!loadingBanks &&
                filteredBanks.length === 0 &&
                banks.length > 0 && (
                  <View style={styles.noBanksContainerSettings}>
                    <Text style={styles.noBanksText}>
                      {searchQuery
                        ? `No banks found matching "${searchQuery}"`
                        : "No additional banks available"}
                    </Text>
                  </View>
                )}

              {Object.entries(banksByName).map(([name, banksWithSameName]) => (
                <View key={name}>
                  {banksWithSameName.length > 1 && (
                    <Text style={styles.bankNameSeparator}>{name}</Text>
                  )}
                  {banksWithSameName.map((bank) => {
                    const isConnected = connected.includes(bank.id);
                    const isLinking = linkingBankId === bank.id;
                    const showCountry = banksWithSameName.length > 1;
                    const countryDisplay =
                      COUNTRY_NAMES[bank.country] || bank.country;

                    return (
                      <TouchableOpacity
                        key={bank.id}
                        style={[
                          styles.bankRow,
                          isConnected && styles.bankRowConnected,
                        ]}
                        onPress={() => !isConnected && handleBankConnect(bank)}
                        disabled={
                          loadingBanks || isConnected || Boolean(linkingBankId)
                        }
                      >
                        <View style={styles.bankNameContainer}>
                          <Text style={[styles.bankName, { color: "#111" }]}>
                            {showCountry
                              ? `${bank.name} (${bank.country})`
                              : bank.name}
                          </Text>
                          {showCountry && (
                            <Text style={styles.bankCountrySubtitle}>
                              {countryDisplay}
                            </Text>
                          )}
                        </View>
                        {isConnected ? (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <View style={styles.connectedBadge}>
                              <Text style={styles.connectedText}>
                                ✓ Connected
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.removeBankBtn}
                              onPress={() =>
                                Alert.alert(
                                  "Remove Bank",
                                  "Are you sure you want to unlink this bank?",
                                  [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                      text: "Remove",
                                      style: "destructive",
                                      onPress: () => handleRemoveBank(bank.id),
                                    },
                                  ],
                                )
                              }
                            >
                              <Text style={styles.removeBankText}>Remove</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <Text style={styles.connectText}>
                            {isLinking ? "Connecting..." : "Connect"}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </>
          )}
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          {[
            {
              iconName: "card-outline",
              label: "Currency & Region",
              value: getCurrencyPreferenceLabel(preferredCurrency),
              onPress: () => navigation.navigate("CurrencySettings"),
            },
            {
              iconName: "notifications-outline",
              label: "Notifications",
              value: "",
              onPress: () => navigation.navigate("NotificationsSettings"),
            },
            {
              iconName: "lock-closed-outline",
              label: "Privacy & Security",
              value: "",
              onPress: () => navigation.navigate("PrivacySecuritySettings"),
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.prefRow}
              onPress={item.onPress}
            >
              <View style={styles.prefIconWrap}>
                <Ionicons name={item.iconName} size={18} color="#5B3FD9" />
              </View>
              <Text style={styles.prefLabel}>{item.label}</Text>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                {item.value ? (
                  <Text style={styles.prefValue}>{item.value}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.2.0 · Build 4829</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F7" },
  container: { flex: 1, backgroundColor: "#F5F5F7", paddingHorizontal: 16 },
  contentContainer: { paddingTop: 24, paddingBottom: 40 },
  backButton: { alignSelf: "flex-start", marginBottom: 6 },
  backButtonText: {
    color: "#5B3FD9",
    fontSize: 14,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  profileName: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  profileEmail: { fontSize: 13, color: "#888", marginTop: 2 },
  profileError: { fontSize: 12, color: "#DC2626", marginBottom: 12 },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE9FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  planText: { fontSize: 12, color: "#5B3FD9", fontWeight: "600" },
  editBtn: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  editBtnText: { fontSize: 14, color: "#444", fontWeight: "500" },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
    marginTop: 4,
  },
  bankDesc: { fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 18 },
  loadingBanksWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  loadingBanksText: { fontSize: 12, color: "#666" },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  bankRowConnected: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  bankName: { fontSize: 15, fontWeight: "600" },
  connectText: { fontSize: 13, color: "#666" },
  connectedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  connectedText: { color: "#16A34A", fontSize: 13, fontWeight: "600" },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  prefIconWrap: { marginRight: 12, justifyContent: "center", alignItems: "center" },
  prefLabel: { fontSize: 14, color: "#1a1a1a" },
  prefValue: { fontSize: 13, color: "#888" },
  signOutBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  signOutText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  version: { textAlign: "center", fontSize: 12, color: "#aaa" },
  searchContainerSettings: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 13,
    color: "#1a1a1a",
  },
  searchClearBtn: {
    padding: 6,
  },
  searchClearText: {
    fontSize: 14,
    color: "#999",
  },
  bankNameSeparator: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5B3FD9",
    marginTop: 10,
    marginBottom: 6,
    paddingLeft: 2,
  },
  bankNameContainer: {
    flex: 1,
  },
  bankCountrySubtitle: {
    fontSize: 11,
    color: "#999",
    marginTop: 3,
  },
  noBanksContainerSettings: {
    alignItems: "center",
    paddingVertical: 16,
  },
  noBanksText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  addBankBtn: {
    backgroundColor: "#5B3FD9",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 12,
  },
  addBankBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  backFromAddBankBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 4,
  },
  backFromAddBankBtnText: {
    color: "#5B3FD9",
    fontSize: 14,
    fontWeight: "500",
  },
  removeBankBtn: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
  },
  removeBankText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 13,
  },
});
