const DEFAULT_BACKEND_URL = "http://localhost:4000";

function getBackendBaseUrl() {
  return (process.env.EXPO_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL).replace(
    /\/$/,
    "",
  );
}

async function requestJson(path, options = {}) {
  const baseUrl = getBackendBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Banking request failed.");
  }

  return data;
}

export async function startBankLink({ userId, bankId, appRedirectUrl, aspsp }) {
  return requestJson("/api/banking/link/start", {
    method: "POST",
    body: JSON.stringify({ userId, bankId, appRedirectUrl, aspsp }),
  });
}

export async function getBankProviders(country) {
  const params = new URLSearchParams();
  if (country) {
    params.set("country", country);
  }

  return requestJson(`/api/banking/providers?${params.toString()}`);
}

export async function getLinkedBanks(userId) {
  const params = new URLSearchParams({ userId });
  return requestJson(`/api/banking/links?${params.toString()}`);
}

export async function getDetectedBankSubscriptions(userId) {
  const params = new URLSearchParams({ userId });
  return requestJson(
    `/api/banking/subscriptions-detected?${params.toString()}`,
  );
}

export async function getTransactions(userId) {
  const params = new URLSearchParams({ userId });
  return requestJson(`/api/banking/transactions?${params.toString()}`);
}

export async function removeLinkedBank(userId, bankId) {
  const params = new URLSearchParams({ userId, bankId });
  return requestJson(`/api/banking/links?${params.toString()}`, {
    method: "DELETE",
  });
}

export function getBackendHealthUrl() {
  return `${getBackendBaseUrl()}/health`;
}
