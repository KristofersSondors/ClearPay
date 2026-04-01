import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SubscriptionLogo from "../src/components/SubscriptionLogo";
import AsyncStorage from "../src/lib/asyncStorage";
import { getManualSubscriptions } from "../src/lib/manualSubscriptions";
import {
  getCurrencyMeta,
  getPreferredCurrency,
} from "../src/lib/currencyPreferences";
import {
  convertCurrencyAmount,
  getUsdExchangeRates,
} from "../src/lib/currencyConversion";
import { getPrivacySecuritySettings } from "../src/lib/appSettings";
import {
  getLinkedBanks,
  getDetectedBankSubscriptions,
} from "../src/lib/bankingApi";
import { getSupabaseClient, hasSupabaseConfig } from "../src/lib/supabase";
import {
  mergeSubscriptions,
  calculateMonthlySpend,
  calculateUpcomingPayments,
  calculateUpcomingAmount,
} from "../src/lib/transactionMetrics";

const LOCAL_BANKING_USER_ID_KEY = "clearpay_local_banking_user_id";

const StatCard = ({ label, value, sub, subColor, iconName }) => (
  <View style={styles.statCard}>
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? (
        <Text style={[styles.statSub, subColor && { color: subColor }]}>
          {sub}
        </Text>
      ) : null}
    </View>
    <View style={styles.iconBox}>
      <Ionicons name={iconName} size={22} color="#5B3FD9" />
    </View>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const [manualSubscriptions, setManualSubscriptions] = useState([]);
  const [bankSubscriptions, setBankSubscriptions] = useState([]);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [usdRates, setUsdRates] = useState({ USD: 1, EUR: 0.92, GBP: 0.79 });
  const [hideAmountsOnDashboard, setHideAmountsOnDashboard] = useState(false);
  const [amountsRevealed, setAmountsRevealed] = useState(false);
  const [showBankPrompt, setShowBankPrompt] = useState(false);

  const resolveAuthContext = async () => {
    if (hasSupabaseConfig) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user?.id) {
        const provider = String(
          data.user?.app_metadata?.provider ||
            data.user?.identities?.[0]?.provider ||
            "",
        ).toLowerCase();

        return {
          userId: data.user.id,
          provider,
        };
      }
    }

    const localUserId = await AsyncStorage.getItem(LOCAL_BANKING_USER_ID_KEY);
    return {
      userId: localUserId || "",
      provider: "",
    };
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      const [stored, preferred, rates, privacy] = await Promise.all([
        getManualSubscriptions(),
        getPreferredCurrency(),
        getUsdExchangeRates(),
        getPrivacySecuritySettings(),
      ]);
      setManualSubscriptions(stored);
      setPreferredCurrency(preferred);
      setUsdRates(rates);
      const shouldHide = Boolean(privacy?.hideAmountsOnDashboard);
      setHideAmountsOnDashboard(shouldHide);
      setAmountsRevealed(!shouldHide);

      try {
        const { userId, provider } = await resolveAuthContext();
        if (!userId) {
          setShowBankPrompt(false);
          setBankSubscriptions([]);
          return;
        }

        const linked = await getLinkedBanks(userId);
        const linkedBankIds = Array.isArray(linked?.linkedBankIds)
          ? linked.linkedBankIds
          : [];
        setShowBankPrompt(provider === "google" && linkedBankIds.length === 0);

        // Fetch bank-detected subscriptions
        if (linkedBankIds.length > 0) {
          try {
            const bankSubs = await getDetectedBankSubscriptions(userId);
            setBankSubscriptions(
              Array.isArray(bankSubs?.subscriptions)
                ? bankSubs.subscriptions
                : [],
            );
          } catch {
            setBankSubscriptions([]);
          }
        } else {
          setBankSubscriptions([]);
        }
      } catch {
        setShowBankPrompt(false);
        setBankSubscriptions([]);
      }
    };

    loadDashboardData();
    const unsubscribe = navigation.addListener("focus", loadDashboardData);

    return unsubscribe;
  }, [navigation]);

  const preferredCurrencyMeta = getCurrencyMeta(preferredCurrency);
  const currencyPrefix = `${preferredCurrencyMeta.code} `;
  const shouldMaskAmounts = hideAmountsOnDashboard && !amountsRevealed;

  const formatAmountForDashboard = (value) => {
    if (shouldMaskAmounts) {
      return `${currencyPrefix}••••`;
    }
    return `${currencyPrefix}${Number(value || 0).toFixed(2)}`;
  };

  const now = new Date();

  // Merge manual and bank subscriptions
  const allSubscriptions = useMemo(() => {
    return mergeSubscriptions(manualSubscriptions, bankSubscriptions);
  }, [manualSubscriptions, bankSubscriptions]);

  const subscriptionsWithDates = useMemo(() => {
    return allSubscriptions
      .map((item) => {
        const nextDate = item.nextPaymentIso
          ? new Date(item.nextPaymentIso)
          : null;

        if (!nextDate || Number.isNaN(nextDate.getTime())) {
          return null;
        }

        return {
          ...item,
          nextDate,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.nextDate - b.nextDate);
  }, [allSubscriptions]);

  const monthlySpend = useMemo(
    () => calculateMonthlySpend(allSubscriptions, usdRates, preferredCurrency),
    [allSubscriptions, preferredCurrency, usdRates],
  );

  const yearlyProjection = monthlySpend * 12;
  const activeSubscriptions = allSubscriptions.length;

  const upcomingSevenDaysAmount = useMemo(
    () =>
      calculateUpcomingAmount(allSubscriptions, 7, usdRates, preferredCurrency),
    [allSubscriptions, preferredCurrency, usdRates],
  );

  const upcomingPayments = useMemo(() => {
    return calculateUpcomingPayments(allSubscriptions, 30).map((item) => {
      const convertedAmount = convertCurrencyAmount(
        item.amount,
        item.currency,
        preferredCurrency,
        usdRates,
      );

      return {
        name: item.name,
        amount: `${preferredCurrencyMeta.code} ${convertedAmount.toFixed(2)}`,
        originalCurrency: item.currency,
        originalAmount: `${item.currency} ${item.amount.toFixed(2)}`,
        date: item.date,
        emoji: item.emoji,
      };
    });
  }, [
    allSubscriptions,
    preferredCurrency,
    preferredCurrencyMeta.code,
    usdRates,
  ]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Dashboard</Text>
        {hideAmountsOnDashboard ? (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={() => setAmountsRevealed((prev) => !prev)}
          >
            <Text style={styles.revealButtonText}>
              {amountsRevealed ? "Hide amounts" : "Show amounts"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showBankPrompt ? (
        <View style={styles.bankPromptCard}>
          <Text style={styles.bankPromptTitle}>Connect Your Bank</Text>
          <Text style={styles.bankPromptBody}>
            You signed in with Google. Connect your bank account to
            automatically detect subscriptions and recurring payments.
          </Text>
          <TouchableOpacity
            style={styles.bankPromptButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.bankPromptButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Payments</Text>
        <Text style={styles.sectionSub}>Next 30 Days</Text>
      </View>

      {upcomingPayments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No payments in the next 30 days</Text>
          <Text style={styles.emptySub}>
            Add a subscription with the + button to see it here.
          </Text>
        </View>
      ) : (
        upcomingPayments.map((item, index) => (
          <View key={`${item.name}-${index}`} style={styles.paymentRow}>
            <View style={{ marginRight: 12 }}>
              <SubscriptionLogo name={item.name} size={40} radius={10} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentName}>{item.name}</Text>
              <Text style={styles.paymentDate}>{item.date}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.paymentAmount}>
                {shouldMaskAmounts
                  ? `${preferredCurrencyMeta.code} ••••`
                  : item.amount}
              </Text>
              {!shouldMaskAmounts &&
              item.originalCurrency !== preferredCurrencyMeta.code ? (
                <Text style={styles.paymentOriginalCurrency}>
                  Original: {item.originalAmount}
                </Text>
              ) : null}
            </View>
          </View>
        ))
      )}

      <View style={styles.sectionDivider} />

      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Spending Overview</Text>
        <Text style={styles.summarySub}>Totals and projections</Text>
      </View>

      <StatCard
        label="Monthly Spend"
        value={formatAmountForDashboard(monthlySpend)}
        sub={
          bankSubscriptions.length > 0
            ? `From ${manualSubscriptions.length} manual + ${bankSubscriptions.length} bank`
            : "From your added subscriptions"
        }
        iconName="card-outline"
      />
      <StatCard
        label="Yearly Projection"
        value={formatAmountForDashboard(yearlyProjection)}
        sub="Based on monthly totals"
        iconName="trending-up-outline"
      />
      <StatCard
        label="Active Subscriptions"
        value={`${activeSubscriptions}`}
        sub={
          bankSubscriptions.length > 0
            ? `${manualSubscriptions.length} manual + ${bankSubscriptions.length} detected`
            : "Manually added"
        }
        iconName="calendar-outline"
      />
      <StatCard
        label="Upcoming (7 Days)"
        value={formatAmountForDashboard(upcomingSevenDaysAmount)}
        sub={
          upcomingSevenDaysAmount > 0
            ? "Due in the next 7 days"
            : "No upcoming payments this week"
        }
        iconName="wallet-outline"
      />
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  revealButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  revealButtonText: {
    fontSize: 12,
    color: "#5B3FD9",
    fontWeight: "600",
  },
  bankPromptCard: {
    backgroundColor: "#EEF3FF",
    borderColor: "#C7D7FF",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  bankPromptTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  bankPromptBody: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 10,
  },
  bankPromptButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1E40AF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bankPromptButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  statSub: { fontSize: 12, color: "#666", marginTop: 2 },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#F0EEFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: { marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },
  sectionSub: { fontSize: 12, color: "#888" },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E8E8EE",
    marginVertical: 12,
  },
  summaryHeader: { marginBottom: 10 },
  summaryTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },
  summarySub: { fontSize: 12, color: "#888" },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  emptySub: { fontSize: 12, color: "#888", marginTop: 4 },
  paymentRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentEmoji: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentName: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  paymentDate: { fontSize: 12, color: "#888", marginTop: 2 },
  paymentAmount: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  paymentOriginalCurrency: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
});
