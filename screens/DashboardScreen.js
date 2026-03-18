import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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

const StatCard = ({ label, value, sub, subColor, icon }) => (
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
      <Text style={styles.iconText}>{icon}</Text>
    </View>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const [manualSubscriptions, setManualSubscriptions] = useState([]);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [usdRates, setUsdRates] = useState({ USD: 1, EUR: 0.92, GBP: 0.79 });
  const [hideAmountsOnDashboard, setHideAmountsOnDashboard] = useState(false);
  const [amountsRevealed, setAmountsRevealed] = useState(false);

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

  const subscriptionsWithDates = useMemo(() => {
    return manualSubscriptions
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
  }, [manualSubscriptions]);

  const monthlySpend = useMemo(
    () =>
      manualSubscriptions.reduce(
        (sum, item) =>
          sum +
          convertCurrencyAmount(
            Number(item.monthlyAmount || 0),
            item.currency || "USD",
            preferredCurrency,
            usdRates,
          ),
        0,
      ),
    [manualSubscriptions, preferredCurrency, usdRates],
  );

  const yearlyProjection = monthlySpend * 12;
  const activeSubscriptions = manualSubscriptions.length;

  const upcomingSevenDaysAmount = useMemo(() => {
    const inSevenDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    return subscriptionsWithDates
      .filter((item) => item.nextDate >= now && item.nextDate <= inSevenDays)
      .reduce(
        (sum, item) =>
          sum +
          convertCurrencyAmount(
            Number(item.amountValue || 0),
            item.currency || "USD",
            preferredCurrency,
            usdRates,
          ),
        0,
      );
  }, [now, preferredCurrency, subscriptionsWithDates, usdRates]);

  const upcomingPayments = useMemo(() => {
    const inThirtyDays = new Date(now);
    inThirtyDays.setDate(inThirtyDays.getDate() + 30);

    return subscriptionsWithDates
      .filter((item) => item.nextDate >= now && item.nextDate <= inThirtyDays)
      .slice(0, 8)
      .map((item) => {
        const originalCurrency = item.currency || "USD";
        const originalAmount = Number(item.amountValue || 0);
        const convertedAmount = convertCurrencyAmount(
          originalAmount,
          originalCurrency,
          preferredCurrency,
          usdRates,
        );

        return {
          name: item.name,
          amount: `${preferredCurrencyMeta.code} ${convertedAmount.toFixed(2)}`,
          originalCurrency,
          originalAmount: `${originalCurrency} ${originalAmount.toFixed(2)}`,
          date: item.nextDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          emoji: "🧾",
        };
      });
  }, [
    now,
    preferredCurrency,
    preferredCurrencyMeta.code,
    subscriptionsWithDates,
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
            <View style={styles.paymentEmoji}>
              <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
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
        sub="From your added subscriptions"
        icon="💳"
      />
      <StatCard
        label="Yearly Projection"
        value={formatAmountForDashboard(yearlyProjection)}
        sub="Based on monthly totals"
        icon="📈"
      />
      <StatCard
        label="Active Subscriptions"
        value={`${activeSubscriptions}`}
        sub="Manually added"
        icon="📅"
      />
      <StatCard
        label="Upcoming (7 Days)"
        value={formatAmountForDashboard(upcomingSevenDaysAmount)}
        sub={
          upcomingSevenDaysAmount > 0
            ? "Due in the next 7 days"
            : "No upcoming payments this week"
        }
        icon="👛"
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
  iconText: { fontSize: 20 },
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
