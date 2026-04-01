import AsyncStorage from "./asyncStorage";

const PREFERRED_CURRENCY_KEY = "clearpay_preferred_currency";
const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP"];

const CURRENCY_META = {
  USD: { code: "USD", symbol: "$", label: "US Dollar" },
  EUR: { code: "EUR", symbol: "EUR", label: "Euro" },
  GBP: { code: "GBP", symbol: "GBP", label: "British Pound" },
};

function normalizeCurrencyCode(value = "") {
  const upper = String(value).toUpperCase();
  return SUPPORTED_CURRENCIES.includes(upper) ? upper : "USD";
}

export async function getPreferredCurrency() {
  try {
    const raw = await AsyncStorage.getItem(PREFERRED_CURRENCY_KEY);
    return normalizeCurrencyCode(raw || "USD");
  } catch {
    return "USD";
  }
}

export async function setPreferredCurrency(currencyCode) {
  const normalized = normalizeCurrencyCode(currencyCode);
  await AsyncStorage.setItem(PREFERRED_CURRENCY_KEY, normalized);
  return normalized;
}

export function getCurrencyMeta(currencyCode) {
  const normalized = normalizeCurrencyCode(currencyCode);
  return CURRENCY_META[normalized];
}

export function getCurrencyPreferenceLabel(currencyCode) {
  const meta = getCurrencyMeta(currencyCode);
  return `${meta.code} (${meta.symbol})`;
}

export const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) =>
  getCurrencyMeta(code),
);
