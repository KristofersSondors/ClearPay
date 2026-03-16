import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  parseNextPaymentDateInputToIso,
  sanitizeAmountInput,
  sanitizeFrequencyInput,
  sanitizeSubscriptionNameInput,
} from "../utils/authSanitization";

const MANUAL_SUBSCRIPTIONS_KEY = "clearpay_manual_subscriptions";

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function computeMonthlyAmount(amount, frequency) {
  const safeAmount = toNumber(amount);

  if (frequency === "Weekly") {
    return (safeAmount * 52) / 12;
  }

  if (frequency === "Yearly") {
    return safeAmount / 12;
  }

  return safeAmount;
}

function getNextPaymentDate(frequency) {
  const date = new Date();

  if (frequency === "Weekly") {
    date.setDate(date.getDate() + 7);
  } else if (frequency === "Yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString();
}

export async function getManualSubscriptions() {
  try {
    const raw = await AsyncStorage.getItem(MANUAL_SUBSCRIPTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addManualSubscription({
  provider,
  frequency,
  amount,
  currency,
  nextPaymentIso,
}) {
  const cleanProvider = sanitizeSubscriptionNameInput(String(provider || ""));
  const amountValue = toNumber(sanitizeAmountInput(amount));
  const cleanFrequency = sanitizeFrequencyInput(String(frequency || "Monthly"));
  const cleanCurrency = String(currency || "USD");
  const parsedNextPaymentIso =
    nextPaymentIso || getNextPaymentDate(cleanFrequency);

  const next = {
    id: `manual-${Date.now()}`,
    name: cleanProvider,
    frequency: cleanFrequency,
    amountValue,
    currency: cleanCurrency,
    monthlyAmount: computeMonthlyAmount(amountValue, cleanFrequency),
    nextPaymentIso: parsedNextPaymentIso,
    createdAt: new Date().toISOString(),
  };

  const existing = await getManualSubscriptions();
  const updated = [next, ...existing];
  await AsyncStorage.setItem(MANUAL_SUBSCRIPTIONS_KEY, JSON.stringify(updated));

  return next;
}

export async function updateManualSubscription(id, updates = {}) {
  const existing = await getManualSubscriptions();
  const target = existing.find((item) => item.id === id);

  if (!target) {
    return null;
  }

  const cleanName =
    updates.provider !== undefined
      ? sanitizeSubscriptionNameInput(updates.provider)
      : target.name;
  const cleanFrequency = sanitizeFrequencyInput(
    updates.frequency !== undefined ? updates.frequency : target.frequency,
  );
  const cleanAmountValue =
    updates.amount !== undefined
      ? toNumber(sanitizeAmountInput(updates.amount))
      : toNumber(target.amountValue);

  let nextPaymentIso = target.nextPaymentIso;
  if (updates.nextPaymentDate !== undefined) {
    nextPaymentIso =
      parseNextPaymentDateInputToIso(updates.nextPaymentDate) || nextPaymentIso;
  }

  const updatedItem = {
    ...target,
    name: cleanName,
    frequency: cleanFrequency,
    amountValue: cleanAmountValue,
    monthlyAmount: computeMonthlyAmount(cleanAmountValue, cleanFrequency),
    nextPaymentIso,
  };

  const updatedList = existing.map((item) =>
    item.id === id ? updatedItem : item,
  );

  await AsyncStorage.setItem(
    MANUAL_SUBSCRIPTIONS_KEY,
    JSON.stringify(updatedList),
  );
  return updatedItem;
}
