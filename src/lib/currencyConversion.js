import AsyncStorage from "@react-native-async-storage/async-storage";

const EXCHANGE_RATES_CACHE_KEY = "clearpay_exchange_rates_usd";
const EXCHANGE_RATES_TTL_MS = 12 * 60 * 60 * 1000;

// Fallback rates in case network fetch fails.
const FALLBACK_USD_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

function normalizeRateMap(rates = {}) {
  return {
    USD: Number(rates.USD) || 1,
    EUR: Number(rates.EUR) || FALLBACK_USD_RATES.EUR,
    GBP: Number(rates.GBP) || FALLBACK_USD_RATES.GBP,
  };
}

function isCacheFresh(timestamp) {
  return (
    Number.isFinite(timestamp) && Date.now() - timestamp < EXCHANGE_RATES_TTL_MS
  );
}

export async function getUsdExchangeRates() {
  try {
    const cachedRaw = await AsyncStorage.getItem(EXCHANGE_RATES_CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (cached && isCacheFresh(cached.timestamp) && cached.rates) {
        return normalizeRateMap(cached.rates);
      }
    }
  } catch {
    // Ignore cache read errors and continue to fetch/fallback.
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const payload = await response.json();
    if (!payload?.rates) {
      throw new Error("Invalid exchange rate response");
    }

    const normalized = normalizeRateMap(payload.rates);
    try {
      await AsyncStorage.setItem(
        EXCHANGE_RATES_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), rates: normalized }),
      );
    } catch {
      // Ignore cache write errors.
    }

    return normalized;
  } catch {
    return FALLBACK_USD_RATES;
  }
}

export function convertCurrencyAmount(
  amount,
  fromCurrency,
  toCurrency,
  usdRates,
) {
  const value = Number(amount || 0);
  const from = String(fromCurrency || "USD").toUpperCase();
  const to = String(toCurrency || "USD").toUpperCase();

  if (!Number.isFinite(value)) {
    return 0;
  }

  if (from === to) {
    return value;
  }

  const rates = normalizeRateMap(usdRates || FALLBACK_USD_RATES);
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;

  const amountInUsd = from === "USD" ? value : value / fromRate;
  return to === "USD" ? amountInUsd : amountInUsd * toRate;
}
