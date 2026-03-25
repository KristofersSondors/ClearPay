import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getBackendHealthUrl,
  getBankProviders,
  getDetectedBankSubscriptions,
  getLinkedBanks,
  startBankLink,
} from "../src/lib/bankingApi";
import { getSupabaseClient, hasSupabaseConfig } from "../src/lib/supabase";

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

export default function BankLinkingScreen({ navigation, route }) {
  const [banks, setBanks] = useState([]);
  const [connected, setConnected] = useState([]);
  const [importedSubscriptions, setImportedSubscriptions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loadingState, setLoadingState] = useState(true);
  const [linkingBankId, setLinkingBankId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const showSignupSuccess = Boolean(route?.params?.signupSuccess);

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

  const loadLinkedState = async (userId) => {
    const [linkedResponse, subscriptionsResponse] = await Promise.all([
      getLinkedBanks(userId),
      getDetectedBankSubscriptions(userId),
    ]);

    setConnected(
      Array.isArray(linkedResponse?.linkedBankIds)
        ? linkedResponse.linkedBankIds
        : [],
    );
    setImportedSubscriptions(
      Array.isArray(subscriptionsResponse?.subscriptions)
        ? subscriptionsResponse.subscriptions
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

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const userId = await resolveCurrentUserId();
        setCurrentUserId(userId);
        await loadBankProviders();
        await loadLinkedState(userId);
      } catch {
        Alert.alert(
          "Banking service unavailable",
          `Make sure backend is running (${getBackendHealthUrl()}).`,
        );
      } finally {
        setLoadingState(false);
      }
    };

    bootstrap();
  }, []);

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
        await loadLinkedState(currentUserId);
      }
    } catch (error) {
      Alert.alert("Bank linking failed", error?.message || "Please try again.");
    } finally {
      setLinkingBankId("");
    }
  };

  const canProceed = connected.length > 0;
  const importedCountLabel = useMemo(() => {
    const count = importedSubscriptions.length;
    if (count === 0) {
      return "No subscriptions imported yet.";
    }
    if (count === 1) {
      return "1 subscription imported from linked banks.";
    }
    return `${count} subscriptions imported from linked banks.`;
  }, [importedSubscriptions.length]);

  // Search and filter logic
  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) {
      return banks;
    }
    const query = searchQuery.toLowerCase();
    return banks.filter((bank) => {
      const countryName = COUNTRY_NAMES[bank.country] || bank.country;
      return (
        bank.name.toLowerCase().includes(query) ||
        bank.country.toLowerCase().includes(query) ||
        countryName.toLowerCase().includes(query)
      );
    });
  }, [banks, searchQuery]);

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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressBar}>
          <View style={[styles.seg, styles.segActive]} />
          <View style={[styles.seg, styles.segActive]} />
          <View style={styles.seg} />
        </View>

        <View style={styles.logoBox}>
          <Text style={styles.logoText}>C</Text>
        </View>
        <Text style={styles.title}>Link your bank accounts</Text>
        <Text style={styles.subtitle}>
          Select your bank to securely connect and automatically import
          subscriptions.
        </Text>

        {showSignupSuccess ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>
              Profile created successfully. Now link your bank account.
            </Text>
          </View>
        ) : null}

        {/* Search input */}
        <View style={styles.searchContainerBanking}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search banks by name or country..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
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

        {loadingState ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#5B3FD9" />
            <Text style={styles.loadingText}>Loading bank connections...</Text>
          </View>
        ) : null}

        {!loadingState && filteredBanks.length === 0 && (
          <View style={styles.noBanksContainer}>
            <Text style={styles.noBanksText}>
              No banks found matching "{searchQuery}"
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
                  disabled={isConnected || Boolean(linkingBankId)}
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
                    <View style={styles.connectedBadge}>
                      <Text style={styles.connectedText}>✓ Connected</Text>
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

        <Text style={styles.importedSubText}>{importedCountLabel}</Text>

        <TouchableOpacity
          style={[styles.btnPrimary, canProceed && styles.btnActive]}
          onPress={() => canProceed && navigation.navigate("Main")}
        >
          <Text style={styles.btnText}>
            {canProceed ? "Finish & Go to Dashboard" : "Link at least 1 bank"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0F0F5" },
  container: { flexGrow: 1, alignItems: "center", padding: 24, paddingTop: 20 },
  progressBar: {
    flexDirection: "row",
    width: "100%",
    gap: 6,
    marginBottom: 24,
  },
  seg: { flex: 1, height: 4, backgroundColor: "#DDD", borderRadius: 2 },
  segActive: { backgroundColor: "#5B3FD9" },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#5B3FD9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  successBanner: {
    width: "100%",
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  successBannerText: { color: "#166534", fontSize: 13, fontWeight: "600" },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
  },
  bankRowConnected: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  bankName: { fontSize: 16, fontWeight: "600" },
  connectText: { fontSize: 13, color: "#666" },
  connectedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  connectedText: { color: "#16A34A", fontSize: 13, fontWeight: "600" },
  loadingWrap: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: { fontSize: 12, color: "#666" },
  importedSubText: {
    marginTop: 4,
    marginBottom: 8,
    alignSelf: "flex-start",
    color: "#556",
    fontSize: 12,
  },
  btnPrimary: {
    backgroundColor: "#A78BCA",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    marginBottom: 14,
  },
  btnActive: { backgroundColor: "#5B3FD9" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  searchContainerBanking: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#1a1a1a",
  },
  searchClearBtn: {
    padding: 8,
  },
  searchClearText: {
    fontSize: 16,
    color: "#999",
  },
  bankNameSeparator: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5B3FD9",
    marginTop: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  bankNameContainer: {
    flex: 1,
  },
  bankCountrySubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  noBanksContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 24,
  },
  noBanksText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
