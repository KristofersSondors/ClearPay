import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  Modal,
  Keyboard,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SubscriptionLogo from "../src/components/SubscriptionLogo";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  removeManualSubscription,
  updateManualSubscription,
} from "../src/lib/manualSubscriptions";
import { getSupabaseClient } from "../src/lib/supabase";
import {
  sanitizeAmountInput,
  sanitizeFrequencyInput,
  sanitizeNextPaymentDateInput,
  validateSubscriptionInput,
} from "../src/utils/authSanitization";
import {
  TOGGLE_TRACK_COLOR,
  getToggleThumbColor,
} from "../src/lib/toggleBehavior";
import {
  clearSubscriptionLogoOverride,
  getSubscriptionLogoOverrides,
  setSubscriptionLogoOverride,
} from "../src/lib/subscriptionLogoOverrides";
import {
  inferSubscriptionLogoDomain,
  normalizeLogoDomain,
} from "../src/lib/subscriptionLogos";

const FREQUENCIES = ["Weekly", "Monthly", "Yearly"];
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isoToDateInput(isoValue = "") {
  if (!isoValue) {
    return "";
  }

  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function parseDateInputToDate(dateInput = "") {
  if (!dateInput) {
    return new Date();
  }

  const parsed = new Date(`${dateInput}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function formatDateToInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSuggestedNextPaymentDateInput(frequency) {
  const nextDate = new Date();

  if (frequency === "Weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (frequency === "Yearly") {
    nextDate.setDate(nextDate.getDate() + 365);
  } else {
    nextDate.setDate(nextDate.getDate() + 30);
  }

  return formatDateToInput(nextDate);
}

function getBackendBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "http://localhost:4000"
  ).replace(/\/$/, "");
}

function shiftMonth(date, amount) {
  const shifted = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  return shifted;
}

function sameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarCells(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) {
    cells.push({ key: `empty-${i}`, empty: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ key: `day-${day}`, empty: false, date, day });
  }

  return cells;
}

export default function SubscriptionDetailScreen({ route, navigation }) {
  const { sub } = route.params;
  const initialFrequency = sanitizeFrequencyInput(
    sub.freq || sub.frequency || "Monthly",
  );
  const initialNextPaymentDate =
    isoToDateInput(sub.nextPaymentIso || sub.nextPaymentIso) ||
    sanitizeNextPaymentDateInput(sub.nextPaymentDate || "");
  const [notify, setNotify] = useState(true);
  const [daysBefore, setDaysBefore] = useState("3 days");
  // Always use the original user-entered amount for editing
  const [amount, setAmount] = useState(
    sanitizeAmountInput(
      String(
        sub.amount !== undefined
          ? sub.amount
          : sub.amountValue !== undefined
            ? sub.amountValue
            : "",
      ),
    ),
  );
  const [frequency, setFrequency] = useState(initialFrequency);
  const [nextPaymentDate, setNextPaymentDate] = useState(
    initialNextPaymentDate,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    parseDateInputToDate(initialNextPaymentDate),
  );
  const [freqOpen, setFreqOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const inferredLogoDomain = inferSubscriptionLogoDomain(sub.name || "");
  const [logoDomainInput, setLogoDomainInput] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadLogoOverride = async () => {
      let overrides = {};
      try {
        overrides = await getSubscriptionLogoOverrides();
      } catch {
        overrides = {};
      }
      if (!isMounted) {
        return;
      }

      const existingOverride = normalizeLogoDomain(overrides?.[sub.id] || "");
      const existingFromSubscription = normalizeLogoDomain(sub.logoDomain || "");
      const initialInput =
        existingOverride ||
        (existingFromSubscription &&
        existingFromSubscription !== inferredLogoDomain
          ? existingFromSubscription
          : "");

      setLogoDomainInput(initialInput);
    };

    loadLogoOverride();

    return () => {
      isMounted = false;
    };
  }, [inferredLogoDomain, sub.id, sub.logoDomain]);

  // Compute the normalized monthly projection for display
  function computeMonthlyAmount(amount, frequency) {
    const safeAmount = Number(String(amount).replace(/[^\d.]/g, ""));
    if (frequency === "Weekly") {
      return (safeAmount * 52) / 12;
    }
    if (frequency === "Yearly") {
      return safeAmount / 12;
    }
    return safeAmount;
  }
  const monthlyProjection = computeMonthlyAmount(amount, frequency);
  const normalizedLogoDomainInput = normalizeLogoDomain(logoDomainInput);
  const effectiveLogoDomain = normalizedLogoDomainInput || inferredLogoDomain;

  const days = ["1 day", "3 days", "7 days", "14 days"];

  const handleSave = async () => {
    const cleanAmount = sanitizeAmountInput(amount);
    const cleanFrequency = sanitizeFrequencyInput(frequency);
    const cleanDateInput = sanitizeNextPaymentDateInput(nextPaymentDate);
    const hasLogoInput = Boolean(String(logoDomainInput || "").trim());
    const normalizedLogoDomain = normalizeLogoDomain(logoDomainInput);
    const cleanLogoDomain =
      normalizedLogoDomain && normalizedLogoDomain !== inferredLogoDomain
        ? normalizedLogoDomain
        : "";
    const frequencyChanged = cleanFrequency !== initialFrequency;
    const dateWasUnchanged = cleanDateInput === initialNextPaymentDate;
    const cleanDate =
      frequencyChanged && dateWasUnchanged
        ? getSuggestedNextPaymentDateInput(cleanFrequency)
        : cleanDateInput;

    setAmount(cleanAmount);
    setFrequency(cleanFrequency);
    setNextPaymentDate(cleanDate);

    if (hasLogoInput && !normalizedLogoDomain) {
      Alert.alert(
        "Invalid logo domain",
        "Please enter a valid domain like netflix.com.",
      );
      return;
    }

    const errors = validateSubscriptionInput({
      provider: sub.name,
      amount: cleanAmount,
      frequency: cleanFrequency,
      nextPaymentDate: cleanDate,
    });

    if (errors.length > 0) {
      Alert.alert("Invalid input", errors[0]);
      return;
    }

    try {
      setSaving(true);
      if (sub.source === "manual") {
        await updateManualSubscription(sub.id, {
          amount: cleanAmount,
          frequency: cleanFrequency,
          nextPaymentDate: cleanDate,
          logoDomain: cleanLogoDomain,
        });
      } else {
        // Detected subscription: persist edit via backend
        const supabase = getSupabaseClient();
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user?.id) {
          throw new Error("Not authenticated");
        }
        const userId = userData.user.id;
        const backendBaseUrl = getBackendBaseUrl();
        const response = await fetch(
          `${backendBaseUrl}/api/banking/subscriptions-detected/${encodeURIComponent(sub.id)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              name: sub.name,
              amount: cleanAmount,
              currency: sub.currency,
              frequency: cleanFrequency,
              nextPaymentIso: cleanDate,
              logoDomain: cleanLogoDomain,
            }),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to update subscription");
        }
      }

      if (cleanLogoDomain) {
        await setSubscriptionLogoOverride(sub.id, cleanLogoDomain);
      } else {
        await clearSubscriptionLogoOverride(sub.id);
      }

      Alert.alert("Saved", "Subscription updated successfully.");
      navigation.goBack();
    } catch {
      Alert.alert("Save failed", "Unable to update this subscription.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel subscription",
      `Remove ${sub.name} from your subscriptions?`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Cancel subscription",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await removeManualSubscription(sub.id);
              navigation.replace("CancellationSuccess");
            } catch {
              Alert.alert(
                "Cancellation failed",
                "Unable to remove this subscription right now.",
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const openDatePicker = () => {
    Keyboard.dismiss();
    setFreqOpen(false);
    const baseDate = parseDateInputToDate(nextPaymentDate);
    setCalendarMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    setShowDatePicker(true);
  };

  const pickDate = (date) => {
    setNextPaymentDate(formatDateToInput(date));
    setShowDatePicker(false);
  };

  const selectedDate = parseDateInputToDate(nextPaymentDate);
  const calendarCells = getCalendarCells(calendarMonth);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.heroSection}>
          <SubscriptionLogo
            name={sub.name}
            color={sub.color}
            logoDomain={effectiveLogoDomain}
            size={88}
            radius={22}
          />
          <Text style={styles.heroName}>{sub.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next payment date:</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={openDatePicker}
            >
              <Text style={styles.dateSelectorText}>
                {nextPaymentDate || "Select date"}
              </Text>
              <Ionicons name="calendar-outline" size={16} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <View style={styles.amountFieldRow}>
              <Text style={styles.currencyText}>{sub.currency || "USD"}</Text>
              <TextInput
                style={styles.infoInput}
                value={amount}
                onChangeText={(value) => setAmount(sanitizeAmountInput(value))}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          {/* Show the normalized monthly projection below the input */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 12, color: "#888" }}>
              Monthly projection:{" "}
              {Number.isFinite(monthlyProjection)
                ? monthlyProjection.toFixed(2)
                : "0.00"}{" "}
              {sub.currency || "USD"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Frequency:</Text>
            <View style={{ width: 140 }}>
              <TouchableOpacity
                style={styles.select}
                onPress={() => setFreqOpen(!freqOpen)}
              >
                <Text style={styles.selectText}>{frequency}</Text>
                <Text style={styles.arrow}>{freqOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>
              {freqOpen && (
                <View style={styles.dropdown}>
                  {FREQUENCIES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropItem}
                      onPress={() => {
                        setFrequency(sanitizeFrequencyInput(item));
                        setFreqOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropText,
                          frequency === item && styles.dropTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.logoSection}>
            <Text style={styles.infoLabel}>Logo domain (optional):</Text>
            <TextInput
              style={styles.logoDomainInput}
              value={logoDomainInput}
              onChangeText={setLogoDomainInput}
              placeholder={
                inferredLogoDomain
                  ? `Auto: ${inferredLogoDomain}`
                  : "e.g. netflix.com"
              }
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.logoHint}>
              Leave blank to use automatic logo matching by subscription name.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelBtn, saving && styles.saveBtnDisabled]}
          onPress={handleCancelSubscription}
          disabled={saving}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {!saving && <Ionicons name="remove-circle-outline" size={18} color="#fff" />}
            <Text style={styles.cancelBtnText}>
              {saving ? "Canceling..." : "Cancel subscription"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.notifyRow}>
          <Text style={styles.notifyLabel}>
            I want to be notified before my next payment
          </Text>
          <Switch
            value={notify}
            onValueChange={setNotify}
            trackColor={TOGGLE_TRACK_COLOR}
            thumbColor={getToggleThumbColor(notify)}
          />
        </View>

        <Text style={styles.daysLabel}>
          How many days before the payment should I be notified
        </Text>
        <View style={styles.daysRow}>
          {days.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayPill, daysBefore === d && styles.dayPillActive]}
              onPress={() => setDaysBefore(d)}
            >
              <Text
                style={[
                  styles.dayText,
                  daysBefore === d && styles.dayTextActive,
                ]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select next payment date</Text>

            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() => setCalendarMonth(shiftMonth(calendarMonth, -1))}
              >
                <Text style={styles.calendarNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>
                {MONTH_NAMES[calendarMonth.getMonth()]}{" "}
                {calendarMonth.getFullYear()}
              </Text>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() => setCalendarMonth(shiftMonth(calendarMonth, 1))}
              >
                <Text style={styles.calendarNavText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((item) => (
                <Text key={item} style={styles.weekDayLabel}>
                  {item}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((cell) => {
                if (cell.empty) {
                  return <View key={cell.key} style={styles.dayCell} />;
                }

                const active = sameDate(cell.date, selectedDate);

                return (
                  <TouchableOpacity
                    key={cell.key}
                    style={[styles.dayCell, active && styles.dayCellActive]}
                    onPress={() => pickDate(cell.date)}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        active && styles.dayCellTextActive,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F7" },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: "#5B3FD9", fontSize: 15, fontWeight: "500" },
  heroSection: { alignItems: "center", marginBottom: 20 },
  subIconLarge: {
    width: 88,
    height: 88,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  heroName: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoInput: {
    minWidth: 120,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1a1a1a",
    textAlign: "right",
  },
  dateSelector: {
    minWidth: 140,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dateSelectorText: { fontSize: 13, color: "#1a1a1a" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
  },
  calendarNavText: { fontSize: 20, color: "#444", lineHeight: 20 },
  calendarMonthText: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekDayLabel: {
    width: "14.28%",
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    paddingVertical: 4,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  dayCellActive: { backgroundColor: "#5B3FD9" },
  dayCellText: { color: "#333", fontSize: 13, fontWeight: "500" },
  dayCellTextActive: { color: "#fff", fontWeight: "700" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  modalBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  modalBtnSecondaryText: { color: "#444", fontSize: 13, fontWeight: "600" },
  modalBtnPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#5B3FD9",
  },
  modalBtnPrimaryText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  amountFieldRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  currencyText: { fontSize: 13, color: "#666", fontWeight: "600" },
  select: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectText: { fontSize: 13, color: "#1a1a1a" },
  arrow: { fontSize: 11, color: "#888" },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 4,
    overflow: "hidden",
  },
  dropItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  dropText: { fontSize: 13, color: "#444" },
  dropTextActive: { color: "#5B3FD9", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F0F0F0" },
  logoSection: {
    paddingTop: 12,
    gap: 8,
  },
  logoDomainInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 13,
    color: "#1a1a1a",
  },
  logoHint: {
    fontSize: 12,
    color: "#777",
    lineHeight: 16,
  },
  saveBtn: {
    backgroundColor: "#5B3FD9",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  cancelBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  cancelBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  notifyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notifyLabel: { fontSize: 14, color: "#1a1a1a", flex: 1, marginRight: 10 },
  daysLabel: { fontSize: 13, color: "#666", marginBottom: 10 },
  daysRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  dayPill: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  dayPillActive: { borderColor: "#5B3FD9", backgroundColor: "#EEE9FF" },
  dayText: { fontSize: 13, color: "#666" },
  dayTextActive: { color: "#5B3FD9", fontWeight: "600" },
});
