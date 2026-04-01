/**
 * Calculate spending metrics from bank transactions and subscriptions
 */

import { convertCurrencyAmount } from "./currencyConversion";
import { computeMonthlyAmount } from "./manualSubscriptions";

export function calculateMonthlySpend(
  subscriptions,
  usdRates,
  preferredCurrency,
) {
  if (!subscriptions || subscriptions.length === 0) return 0;

  return subscriptions.reduce((sum, sub) => {
    // Use the original amount and frequency for monthly calculation
    const baseAmount =
      sub.amountValue !== undefined ? sub.amountValue : sub.amount;
    const freq = sub.frequency || "Monthly";
    const monthlyAmount = computeMonthlyAmount(baseAmount, freq);
    const currency = sub.currency || "USD";

    const converted = convertCurrencyAmount(
      monthlyAmount,
      currency,
      preferredCurrency,
      usdRates,
    );
    return sum + converted;
  }, 0);
}

export function calculateUpcomingPayments(subscriptions, days = 30) {
  if (!subscriptions || subscriptions.length === 0) return [];

  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);

  return subscriptions
    .filter((sub) => {
      if (!sub.nextPaymentIso) return false;
      const nextDate = new Date(sub.nextPaymentIso);
      return nextDate >= now && nextDate <= futureDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.nextPaymentIso);
      const dateB = new Date(b.nextPaymentIso);
      return dateA - dateB;
    })
    .slice(0, 8)
    .map((sub) => ({
      id: sub.id,
      name: sub.name,
      amount: Number(sub.amountValue || 0),
      currency: sub.currency || "USD",
      frequency: sub.frequency || "Monthly",
      nextPaymentIso: sub.nextPaymentIso,
      source: sub.source || "manual", // "manual" or "bank"
      date: new Date(sub.nextPaymentIso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      emoji: sub.source === "bank" ? "🏦" : "🧾",
    }));
}

export function calculateUpcomingAmount(
  subscriptions,
  days = 7,
  usdRates,
  preferredCurrency,
) {
  if (!subscriptions || subscriptions.length === 0) return 0;

  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);

  return subscriptions
    .filter((sub) => {
      if (!sub.nextPaymentIso) return false;
      const nextDate = new Date(sub.nextPaymentIso);
      return nextDate >= now && nextDate <= futureDate;
    })
    .reduce((sum, sub) => {
      const amount = Number(sub.amountValue || 0);
      const currency = sub.currency || "USD";

      const converted = convertCurrencyAmount(
        amount,
        currency,
        preferredCurrency,
        usdRates,
      );
      return sum + converted;
    }, 0);
}

export function mergeSubscriptions(manual, bankDetected) {
  // Combine manual and bank-detected subscriptions
  // Mark source and avoid duplicates
  const combined = [];
  const seen = new Set();

  // Add manual subscriptions
  if (Array.isArray(manual)) {
    manual.forEach((sub) => {
      const key = `${sub.name.toLowerCase()}-manual`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({
          ...sub,
          source: "manual",
        });
      }
    });
  }

  // Add bank-detected subscriptions
  if (Array.isArray(bankDetected)) {
    bankDetected.forEach((sub) => {
      const key = `${sub.name.toLowerCase()}-${sub.source || "bank"}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({
          ...sub,
          source: sub.source || "bank",
        });
      }
    });
  }

  return combined;
}

export function filterBySource(subscriptions, source) {
  // Filter subscriptions by source: "manual", "bank", or null for all
  if (!source) return subscriptions;
  return subscriptions.filter((sub) => sub.source === source);
}

export function getSpendingByMerchant(subscriptions, limit = 10) {
  if (!subscriptions || subscriptions.length === 0) return [];

  const byMerchant = {};

  subscriptions.forEach((sub) => {
    const merchant = sub.name;
    if (!byMerchant[merchant]) {
      byMerchant[merchant] = {
        name: merchant,
        totalMonthly: 0,
        count: 0,
        currency: sub.currency || "USD",
        source: sub.source || "manual",
      };
    }

    const monthlyAmount = sub.monthlyAmount || sub.amountValue || 0;
    byMerchant[merchant].totalMonthly += Number(monthlyAmount);
    byMerchant[merchant].count += 1;
  });

  return Object.values(byMerchant)
    .sort((a, b) => b.totalMonthly - a.totalMonthly)
    .slice(0, limit);
}
