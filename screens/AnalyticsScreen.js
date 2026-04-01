import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Svg, { G, Path } from "react-native-svg";
import { getManualSubscriptions } from "../src/lib/manualSubscriptions";
import {
  getDetectedBankSubscriptions,
  getLinkedBanks,
} from "../src/lib/bankingApi";
import { getSupabaseClient, hasSupabaseConfig } from "../src/lib/supabase";
import AsyncStorage from "../src/lib/asyncStorage";
import {
  getCurrencyMeta,
  getPreferredCurrency,
} from "../src/lib/currencyPreferences";
import {
  convertCurrencyAmount,
  getUsdExchangeRates,
} from "../src/lib/currencyConversion";
import { mergeSubscriptions } from "../src/lib/transactionMetrics";

const W = Dimensions.get("window").width - 32;
const LOCAL_BANKING_USER_ID_KEY = "clearpay_local_banking_user_id";

function resolveSubscriptionStartDate(item) {
  const candidates = [
    item.createdAt,
    item.importedAt,
    item.updatedAt,
    item.nextPaymentIso,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

function monthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function weekLabel(date) {
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}-${end.toLocaleDateString("en-US", { day: "numeric" })}`;
}

function yearLabel(date) {
  return String(date.getFullYear());
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function addWeeks(date, weeks) {
  const next = new Date(date);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

function addYears(date, years) {
  return new Date(date.getFullYear() + years, 0, 1);
}

const DonutChart = ({ data, currencyCode }) => {
  const [selectedLabel, setSelectedLabel] = useState("");
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 55;
  const innerR = 32;

  if (total <= 0) {
    return <Text style={styles.emptyChartText}>No subscription data yet.</Text>;
  }

  const chartData = data.filter((item) => item.value > 0);
  const selected =
    chartData.find((item) => item.label === selectedLabel) ||
    chartData[0] ||
    null;

  let cumulative = 0;
  const slices = chartData.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const isSelected = d.label === selected?.label;
    const outerRadius = isSelected ? r + 5 : r;
    const midAngle = (startAngle + endAngle) / 2;
    const pull = isSelected ? 4 : 0;
    const dx = pull * Math.cos(midAngle);
    const dy = pull * Math.sin(midAngle);

    const x1 = cx + dx + outerRadius * Math.cos(startAngle);
    const y1 = cy + dy + outerRadius * Math.sin(startAngle);
    const x2 = cx + dx + outerRadius * Math.cos(endAngle);
    const y2 = cy + dy + outerRadius * Math.sin(endAngle);
    const ix1 = cx + dx + innerR * Math.cos(endAngle);
    const iy1 = cy + dy + innerR * Math.sin(endAngle);
    const ix2 = cx + dx + innerR * Math.cos(startAngle);
    const iy2 = cy + dy + innerR * Math.sin(startAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return {
      path: `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`,
      color: d.color,
      label: d.label,
      value: d.value,
      isSelected,
    };
  });

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((s, i) => (
            <Path
              key={`${s.label}-${i}`}
              d={s.path}
              fill={s.color}
              fillOpacity={s.isSelected ? 1 : 0.8}
              onPress={() => setSelectedLabel(s.label)}
            />
          ))}
        </G>
      </Svg>
      {selected ? (
        <View style={styles.chartCenterInfo}>
          <Text style={styles.chartCenterLabel}>{selected.label}</Text>
          <Text style={styles.chartCenterValue}>
            {currencyCode} {selected.value.toFixed(2)}
          </Text>
          <Text style={styles.chartCenterSub}>
            {((selected.value / total) * 100).toFixed(0)}% of monthly spend
          </Text>
        </View>
      ) : null}
      <View style={styles.legend}>
        {data.map((d) => {
          const isActive = d.label === selected?.label;
          return (
            <TouchableOpacity
              key={d.label}
              style={[styles.legendItem, isActive && styles.legendItemActive]}
              onPress={() => setSelectedLabel(d.label)}
            >
              <View style={[styles.legendDot, { backgroundColor: d.color }]} />
              <Text
                style={[styles.legendText, isActive && styles.legendTextActive]}
              >
                {d.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function AnalyticsScreen({ navigation }) {
  const [manualSubscriptions, setManualSubscriptions] = useState([]);
  const [bankSubscriptions, setBankSubscriptions] = useState([]);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [usdRates, setUsdRates] = useState({ USD: 1, EUR: 0.92, GBP: 0.79 });
  const [sourceFilter, setSourceFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");

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

  const toMonthlyAmount = (item) => {
    const direct = Number(item.monthlyAmount);
    if (!Number.isNaN(direct) && direct > 0) {
      return direct;
    }

    const amount =
      item.amountValue !== undefined
        ? Number(item.amountValue)
        : Number(item.amount);
    const safeAmount = Number.isNaN(amount) ? 0 : amount;
    const frequency = item.frequency || "Monthly";

    if (frequency === "Weekly") {
      return (safeAmount * 52) / 12;
    }

    if (frequency === "Yearly") {
      return safeAmount / 12;
    }

    return safeAmount;
  };

  useEffect(() => {
    const loadAnalyticsData = async () => {
      const [stored, preferred, rates] = await Promise.all([
        getManualSubscriptions(),
        getPreferredCurrency(),
        getUsdExchangeRates(),
      ]);
      setManualSubscriptions(stored);
      setPreferredCurrency(preferred);
      setUsdRates(rates);

      try {
        const userId = await resolveUserId();
        if (!userId) {
          setBankSubscriptions([]);
          return;
        }

        const linked = await getLinkedBanks(userId);
        const linkedBankIds = Array.isArray(linked?.linkedBankIds)
          ? linked.linkedBankIds
          : [];

        if (linkedBankIds.length === 0) {
          setBankSubscriptions([]);
          return;
        }

        const bankSubs = await getDetectedBankSubscriptions(userId);
        setBankSubscriptions(
          Array.isArray(bankSubs?.subscriptions) ? bankSubs.subscriptions : [],
        );
      } catch {
        setBankSubscriptions([]);
      }
    };

    loadAnalyticsData();
    const unsubscribe = navigation.addListener("focus", loadAnalyticsData);

    return unsubscribe;
  }, [navigation]);

  const preferredCurrencyMeta = getCurrencyMeta(preferredCurrency);

  const combinedSubscriptions = useMemo(
    () => mergeSubscriptions(manualSubscriptions, bankSubscriptions),
    [manualSubscriptions, bankSubscriptions],
  );

  const filteredSubscriptions = useMemo(() => {
    return combinedSubscriptions.filter((item) => {
      if (sourceFilter !== "all" && item.source !== sourceFilter) {
        return false;
      }

      const frequency = item.frequency || "Monthly";
      if (frequencyFilter !== "all" && frequency !== frequencyFilter) {
        return false;
      }

      return true;
    });
  }, [combinedSubscriptions, sourceFilter, frequencyFilter]);

  const lineData = useMemo(() => {
    const now = new Date();

    const periodConfig =
      frequencyFilter === "Weekly"
        ? {
            points: 8,
            start: addWeeks(now, -7),
            add: (date, step) => addWeeks(date, step),
            label: (date) => weekLabel(date),
            amount: (item) => (toMonthlyAmount(item) * 12) / 52,
          }
        : frequencyFilter === "Yearly"
          ? {
              points: 5,
              start: addYears(new Date(now.getFullYear(), 0, 1), -4),
              add: (date, step) => addYears(date, step),
              label: (date) => yearLabel(date),
              amount: (item) => toMonthlyAmount(item) * 12,
            }
          : {
              points: 6,
              start: addMonths(
                new Date(now.getFullYear(), now.getMonth(), 1),
                -5,
              ),
              add: (date, step) => addMonths(date, step),
              label: (date) => monthLabel(date),
              amount: (item) => toMonthlyAmount(item),
            };

    const periodStarts = Array.from({ length: periodConfig.points }, (_, i) =>
      periodConfig.add(periodConfig.start, i),
    );

    const labels = periodStarts.map((d) => periodConfig.label(d));

    const dataset = periodStarts.map((periodStart) => {
      const periodEnd = periodConfig.add(periodStart, 1);

      return filteredSubscriptions.reduce((sum, item) => {
        const createdAt = resolveSubscriptionStartDate(item);
        if (
          !createdAt ||
          Number.isNaN(createdAt.getTime()) ||
          createdAt >= periodEnd
        ) {
          return sum;
        }

        return (
          sum +
          convertCurrencyAmount(
            periodConfig.amount(item),
            item.currency || "USD",
            preferredCurrency,
            usdRates,
          )
        );
      }, 0);
    });

    return {
      labels,
      datasets: [{ data: dataset.map((value) => Number(value.toFixed(2))) }],
    };
  }, [filteredSubscriptions, preferredCurrency, usdRates, frequencyFilter]);

  const trendTitle =
    frequencyFilter === "Weekly"
      ? "Weekly Spend Trend"
      : frequencyFilter === "Yearly"
        ? "Yearly Spend Trend"
        : "Monthly Spend Trend";

  const spendByFrequency = useMemo(() => {
    const base = {
      Weekly: 0,
      Monthly: 0,
      Yearly: 0,
    };

    filteredSubscriptions.forEach((item) => {
      const key = ["Weekly", "Monthly", "Yearly"].includes(item.frequency)
        ? item.frequency
        : "Monthly";
      base[key] += convertCurrencyAmount(
        toMonthlyAmount(item),
        item.currency || "USD",
        preferredCurrency,
        usdRates,
      );
    });

    return [
      { label: "Weekly", value: base.Weekly, color: "#5B3FD9" },
      { label: "Monthly", value: base.Monthly, color: "#22C55E" },
      { label: "Yearly", value: base.Yearly, color: "#EC4899" },
    ];
  }, [filteredSubscriptions, preferredCurrency, usdRates]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.pageTitle}>Analytics</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Filters</Text>

        <Text style={styles.filterLabel}>Source</Text>
        <View style={styles.filterRow}>
          {[
            { key: "all", label: "All" },
            { key: "manual", label: "Manual" },
            { key: "bank", label: "Bank" },
          ].map((option) => {
            const active = sourceFilter === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setSourceFilter(option.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.filterLabel}>Frequency</Text>
        <View style={styles.filterRow}>
          {["all", "Weekly", "Monthly", "Yearly"].map((frequency) => {
            const active = frequencyFilter === frequency;
            return (
              <TouchableOpacity
                key={frequency}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFrequencyFilter(frequency)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {frequency === "all" ? "All" : frequency}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.filterHint}>
          Showing {filteredSubscriptions.length} of{" "}
          {combinedSubscriptions.length} subscriptions
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{trendTitle}</Text>
        <LineChart
          data={lineData}
          width={W - 16}
          height={180}
          yAxisLabel={`${preferredCurrencyMeta.code} `}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: () => "#5B3FD9",
            labelColor: () => "#888",
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#5B3FD9" },
            propsForBackgroundLines: { stroke: "#F0F0F0" },
          }}
          bezier
          style={{ marginLeft: -16 }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spend by Frequency (Monthly Basis)</Text>
        <DonutChart
          data={spendByFrequency}
          currencyCode={preferredCurrencyMeta.code}
        />
      </View>
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
    marginBottom: 16,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 2,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#fff",
  },
  filterChipActive: {
    borderColor: "#5B3FD9",
    backgroundColor: "#F0EEFF",
  },
  filterChipText: {
    fontSize: 12,
    color: "#444",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#5B3FD9",
    fontWeight: "600",
  },
  filterHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  emptyChartText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    padding: 12,
  },
  chartCenterInfo: {
    marginTop: 4,
    alignItems: "center",
  },
  chartCenterLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  chartCenterValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "700",
    marginTop: 2,
  },
  chartCenterSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  legendItemActive: {
    backgroundColor: "#F5F5F7",
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#555" },
  legendTextActive: { color: "#111", fontWeight: "600" },
});
