import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabaseClient, hasSupabaseConfig } from "./supabase";
import {
  parseNextPaymentDateInputToIso,
  sanitizeAmountInput,
  sanitizeFrequencyInput,
  sanitizeSubscriptionNameInput,
} from "../utils/authSanitization";

const LEGACY_MANUAL_SUBSCRIPTIONS_KEY = "clearpay_manual_subscriptions";
const MANUAL_SUBSCRIPTIONS_KEY_PREFIX = "clearpay_manual_subscriptions";

function parseStoredSubscriptions(rawValue) {
  try {
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function getAuthenticatedUserId() {
  if (!hasSupabaseConfig) {
    return "";
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return "";
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return "";
    }

    return data?.user?.id || "";
  } catch {
    return "";
  }
}

function getSubscriptionsStorageKey(userId) {
  return userId
    ? `${MANUAL_SUBSCRIPTIONS_KEY_PREFIX}:${userId}`
    : `${MANUAL_SUBSCRIPTIONS_KEY_PREFIX}:anonymous`;
}

async function getResolvedSubscriptionsStorageKey() {
  const userId = await getAuthenticatedUserId();
  return getSubscriptionsStorageKey(userId);
}

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
    date.setDate(date.getDate() + 365);
  } else {
    date.setDate(date.getDate() + 30);
  }

  return date.toISOString();
}

export async function getManualSubscriptions() {
  try {
    const userId = await getAuthenticatedUserId();
    if (userId) {
      // Authenticated: fetch from Supabase
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("manual_subscriptions")
        .select(
          "id, name, frequency, amount, currency, monthly_amount, next_payment_iso, created_at, updated_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      // Normalize to match local shape
      return (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        frequency: item.frequency,
        amountValue: item.amount,
        currency: item.currency,
        monthlyAmount: item.monthly_amount,
        nextPaymentIso: item.next_payment_iso,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        source: "manual",
      }));
    }
    // Anonymous: fallback to AsyncStorage
    const storageKey = await getResolvedSubscriptionsStorageKey();
    const scopedRaw = await AsyncStorage.getItem(storageKey);
    const scopedSubscriptions = parseStoredSubscriptions(scopedRaw);
    if (scopedSubscriptions.length > 0) {
      return scopedSubscriptions;
    }
    const legacyRaw = await AsyncStorage.getItem(
      LEGACY_MANUAL_SUBSCRIPTIONS_KEY,
    );
    const legacySubscriptions = parseStoredSubscriptions(legacyRaw);
    // One-time migration of old shared data to the first authenticated account.
    if (
      legacySubscriptions.length > 0 &&
      storageKey !== getSubscriptionsStorageKey("")
    ) {
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify(legacySubscriptions),
      );
      await AsyncStorage.removeItem(LEGACY_MANUAL_SUBSCRIPTIONS_KEY);
      return legacySubscriptions;
    }
    if (storageKey === getSubscriptionsStorageKey("")) {
      return legacySubscriptions;
    }
    return [];
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
    source: "manual",
  };

  const userId = await getAuthenticatedUserId();
  if (userId) {
    // Authenticated: insert into Supabase
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("manual_subscriptions").insert([
      {
        id: next.id,
        user_id: userId,
        name: next.name,
        frequency: next.frequency,
        amount: next.amountValue,
        currency: next.currency,
        monthly_amount: next.monthlyAmount,
        next_payment_iso: next.nextPaymentIso,
        created_at: next.createdAt,
        updated_at: next.createdAt,
      },
    ]);
    if (error) throw error;
    return next;
  }
  // Anonymous: fallback to AsyncStorage
  const existing = await getManualSubscriptions();
  const updated = [next, ...existing];
  const storageKey = await getResolvedSubscriptionsStorageKey();
  await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  return next;
}

export async function updateManualSubscription(id, updates = {}) {
  const userId = await getAuthenticatedUserId();
  if (userId) {
    // Authenticated: update in Supabase
    const supabase = getSupabaseClient();
    // Fetch current item
    const { data, error: fetchError } = await supabase
      .from("manual_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .single();
    if (fetchError || !data) return null;
    const cleanName =
      updates.provider !== undefined
        ? sanitizeSubscriptionNameInput(updates.provider)
        : data.name;
    const cleanFrequency = sanitizeFrequencyInput(
      updates.frequency !== undefined ? updates.frequency : data.frequency,
    );
    const cleanAmountValue =
      updates.amount !== undefined
        ? toNumber(sanitizeAmountInput(updates.amount))
        : toNumber(data.amount);
    let nextPaymentIso = data.next_payment_iso;
    if (updates.nextPaymentDate !== undefined) {
      nextPaymentIso =
        parseNextPaymentDateInputToIso(updates.nextPaymentDate) ||
        nextPaymentIso;
    }
    const updatedItem = {
      ...data,
      name: cleanName,
      frequency: cleanFrequency,
      amount: cleanAmountValue,
      monthly_amount: computeMonthlyAmount(cleanAmountValue, cleanFrequency),
      next_payment_iso: nextPaymentIso,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("manual_subscriptions")
      .update(updatedItem)
      .eq("user_id", userId)
      .eq("id", id);
    if (error) throw error;
    return {
      id: updatedItem.id,
      name: updatedItem.name,
      frequency: updatedItem.frequency,
      amountValue: updatedItem.amount,
      currency: updatedItem.currency,
      monthlyAmount: updatedItem.monthly_amount,
      nextPaymentIso: updatedItem.next_payment_iso,
      createdAt: updatedItem.created_at,
      updatedAt: updatedItem.updated_at,
      source: "manual",
    };
  }
  // Anonymous: fallback to AsyncStorage
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
  const storageKey = await getResolvedSubscriptionsStorageKey();
  await AsyncStorage.setItem(storageKey, JSON.stringify(updatedList));
  return updatedItem;
}

export async function removeManualSubscription(id) {
  const userId = await getAuthenticatedUserId();
  if (userId) {
    // Authenticated: delete from Supabase
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("manual_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);
    if (error) throw error;
    return true;
  }
  // Anonymous: fallback to AsyncStorage
  const existing = await getManualSubscriptions();
  const updatedList = existing.filter((item) => item.id !== id);
  if (updatedList.length === existing.length) {
    return false;
  }
  const storageKey = await getResolvedSubscriptionsStorageKey();
  await AsyncStorage.setItem(storageKey, JSON.stringify(updatedList));
  return true;
}
