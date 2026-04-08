import "dotenv/config";
import cors from "cors";
import express from "express";
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { supabase } from "./lib/supabase.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);
const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const ENABLE_BANKING_MOCK =
  String(process.env.ENABLE_BANKING_MOCK || "true").toLowerCase() !== "false";
const ENABLE_BANKING_BASE_URL =
  process.env.ENABLE_BANKING_BASE_URL || "https://api.enablebanking.com";
const ENABLE_BANKING_APP_ID = process.env.ENABLE_BANKING_APP_ID || "";
const ENABLE_BANKING_PRIVATE_KEY_PEM =
  process.env.ENABLE_BANKING_PRIVATE_KEY_PEM || "";
const ENABLE_BANKING_PRIVATE_KEY_PATH =
  process.env.ENABLE_BANKING_PRIVATE_KEY_PATH || "";
const ENABLE_BANKING_REDIRECT_URI =
  process.env.ENABLE_BANKING_REDIRECT_URI ||
  `${PUBLIC_BASE_URL}/api/banking/link/callback`;
const ENABLE_BANKING_PSU_TYPE =
  process.env.ENABLE_BANKING_PSU_TYPE || "personal";
const ENABLE_BANKING_DEFAULT_COUNTRY =
  process.env.ENABLE_BANKING_DEFAULT_COUNTRY || "FI";
const ENABLE_BANKING_PROVIDER_COUNTRIES =
  process.env.ENABLE_BANKING_PROVIDER_COUNTRIES || "SE,FI,LT,LV,EE";
const ENABLE_BANKING_ASPSP_MAP = process.env.ENABLE_BANKING_ASPSP_MAP || "";

const MOCK_BANK_PROVIDERS = [
  { id: "swedbank", name: "Swedbank", country: "SE" },
  { id: "seb", name: "SEB", country: "SE" },
  { id: "revolut", name: "Revolut", country: "LT" },
  { id: "luminor", name: "Luminor", country: "LT" },
];

const pendingStates = new Map();
const linksByUser = new Map();

const fakeSubscriptionsByBank = {
  swedbank: [
    {
      id: "bank-swedbank-netflix",
      name: "Netflix",
      frequency: "Monthly",
      amountValue: 14.99,
      currency: "EUR",
      monthlyAmount: 14.99,
      nextPaymentIso: new Date(
        Date.now() + 12 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      source: "bank",
      bankId: "swedbank",
    },
  ],
  seb: [
    {
      id: "bank-seb-spotify",
      name: "Spotify",
      frequency: "Monthly",
      amountValue: 9.99,
      currency: "EUR",
      monthlyAmount: 9.99,
      nextPaymentIso: new Date(
        Date.now() + 18 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      source: "bank",
      bankId: "seb",
    },
  ],
  revolut: [
    {
      id: "bank-revolut-youtube",
      name: "YouTube Premium",
      frequency: "Monthly",
      amountValue: 11.99,
      currency: "EUR",
      monthlyAmount: 11.99,
      nextPaymentIso: new Date(
        Date.now() + 8 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      source: "bank",
      bankId: "revolut",
    },
  ],
  luminor: [
    {
      id: "bank-luminor-gym",
      name: "Gym Membership",
      frequency: "Monthly",
      amountValue: 29.99,
      currency: "EUR",
      monthlyAmount: 29.99,
      nextPaymentIso: new Date(
        Date.now() + 6 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      source: "bank",
      bankId: "luminor",
    },
  ],
};

function getUserRecord(userId) {
  if (!linksByUser.has(userId)) {
    linksByUser.set(userId, {
      linkedBanks: new Set(),
      sessions: {},
      subscriptions: [],
      transactions: [],
    });
  }

  return linksByUser.get(userId);
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getPrivateKey() {
  if (ENABLE_BANKING_PRIVATE_KEY_PATH) {
    try {
      const keyPath = path.isAbsolute(ENABLE_BANKING_PRIVATE_KEY_PATH)
        ? ENABLE_BANKING_PRIVATE_KEY_PATH
        : path.resolve(process.cwd(), ENABLE_BANKING_PRIVATE_KEY_PATH);
      return readFileSync(keyPath, "utf8").trim();
    } catch {
      return "";
    }
  }

  return ENABLE_BANKING_PRIVATE_KEY_PEM.replace(/\\n/g, "\n").trim();
}

function getLiveConfigErrors() {
  const errors = [];

  if (!ENABLE_BANKING_APP_ID) {
    errors.push("ENABLE_BANKING_APP_ID is missing");
  }

  if (!getPrivateKey()) {
    errors.push(
      "Enable Banking private key is missing (set ENABLE_BANKING_PRIVATE_KEY_PATH or ENABLE_BANKING_PRIVATE_KEY_PEM)",
    );
  }

  if (!ENABLE_BANKING_REDIRECT_URI) {
    errors.push("ENABLE_BANKING_REDIRECT_URI is missing");
  }

  return errors;
}

function createEnableBankingJwt() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "enablebanking.com",
    aud: "api.enablebanking.com",
    iat: now,
    exp: now + 5 * 60,
  };
  const header = {
    typ: "JWT",
    alg: "RS256",
    kid: ENABLE_BANKING_APP_ID,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();

  const signature = signer
    .sign(getPrivateKey())
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signingInput}.${signature}`;
}

async function requestEnableBanking(
  path,
  { method = "GET", body, headers } = {},
) {
  const jwt = createEnableBankingJwt();
  const response = await fetch(`${ENABLE_BANKING_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.detail ? ` (${String(data.detail)})` : "";
    throw new Error(
      data?.message || `Enable Banking API error ${response.status}${detail}`,
    );
  }

  return data;
}

function parseAspspMap() {
  if (!ENABLE_BANKING_ASPSP_MAP.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(ENABLE_BANKING_ASPSP_MAP);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function toProviderId(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `provider-${Math.random().toString(36).slice(2, 8)}`;
}

function mapAspspToProvider(aspsp) {
  const name = String(aspsp?.name || "").trim();
  const country = String(aspsp?.country || "")
    .trim()
    .toUpperCase();
  const identifier = [aspsp?.uid, aspsp?.id, aspsp?.bic, name, country]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join("-");

  return {
    id: toProviderId(identifier),
    name,
    country: country || "",
    aspsp: {
      uid: aspsp?.uid || "",
      id: aspsp?.id || "",
      name,
      country,
    },
  };
}

async function resolveAspsp(bankId) {
  const aspspMap = parseAspspMap();
  const mapped = aspspMap[bankId];

  if (mapped?.name && mapped?.country) {
    return {
      name: mapped.name,
      country: mapped.country,
    };
  }

  const aspspResponse = await requestEnableBanking("/aspsps?service=AIS");
  const aspsps = Array.isArray(aspspResponse?.aspsps)
    ? aspspResponse.aspsps
    : [];
  const normalizedBankName = String(bankId || "")
    .replace(/[_-]/g, " ")
    .toLowerCase();

  const directMatch = aspsps.find((aspsp) =>
    String(aspsp?.name || "")
      .toLowerCase()
      .includes(normalizedBankName),
  );

  if (directMatch?.name && directMatch?.country) {
    return {
      name: directMatch.name,
      country: directMatch.country,
    };
  }

  throw new Error(
    `Could not resolve ASPSP for bankId \"${bankId}\". Set ENABLE_BANKING_ASPSP_MAP in backend/.env.`,
  );
}

async function getAvailableProviders(countryFilter) {
  if (ENABLE_BANKING_MOCK) {
    return MOCK_BANK_PROVIDERS.map((provider) => ({
      ...provider,
      aspsp: {
        name: provider.name,
        country: provider.country,
      },
    }));
  }

  const aspspResponse = await requestEnableBanking("/aspsps?service=AIS");
  const aspsps = Array.isArray(aspspResponse?.aspsps)
    ? aspspResponse.aspsps
    : [];

  const countrySet = new Set(
    String(countryFilter || "")
      .split(",")
      .map((part) => part.trim().toUpperCase())
      .filter(Boolean),
  );

  const filtered = countrySet.size
    ? aspsps.filter((item) =>
        countrySet.has(
          String(item?.country || "")
            .trim()
            .toUpperCase(),
        ),
      )
    : aspsps;

  return filtered
    .map(mapAspspToProvider)
    .filter((provider) => provider.name && provider.aspsp?.country)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getPsuHeaders(req) {
  const forwardedIp = String(req.headers["x-forwarded-for"] || "")
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);
  const ip = forwardedIp || req.ip || "127.0.0.1";
  const userAgent = String(req.headers["user-agent"] || "ClearPay/1.0");

  return {
    "Psu-Ip-Address": ip,
    "Psu-User-Agent": userAgent,
  };
}

function parseTransactionDate(transaction) {
  const rawDate =
    transaction.booking_date ||
    transaction.value_date ||
    transaction.transaction_date ||
    null;

  if (!rawDate) {
    return null;
  }

  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeMerchantName(transaction) {
  const sanitize = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/order\s*no\s*\d+/gi, "order")
      .replace(/\b\d{4,}\b/g, "")
      .replace(/[^a-z\s&.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const preferred = [
    transaction.creditor?.name,
    transaction.remittance_information?.[0],
    transaction.note,
    transaction.reference_number,
  ];

  for (const item of preferred) {
    const normalized = sanitize(item);
    if (normalized && normalized !== "mr popcorn") {
      return normalized
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
  }

  const fallback = sanitize(transaction.debtor?.name) || "unknown merchant";
  return fallback
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function detectFrequency(diffDays) {
  if (diffDays >= 5 && diffDays <= 10) {
    return { frequency: "Weekly", monthlyMultiplier: 52 / 12, nextDays: 7 };
  }

  if (diffDays >= 25 && diffDays <= 35) {
    return { frequency: "Monthly", monthlyMultiplier: 1, nextDays: 30 };
  }

  if (diffDays >= 330 && diffDays <= 390) {
    return { frequency: "Yearly", monthlyMultiplier: 1 / 12, nextDays: 365 };
  }

  return null;
}

function getMonthlyMultiplierForFrequency(frequency) {
  const normalized = String(frequency || "").toLowerCase();

  if (normalized === "weekly") {
    return 52 / 12;
  }

  if (normalized === "yearly") {
    return 1 / 12;
  }

  return 1;
}

function normalizeLogoDomain(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";

  const withoutProtocol = raw.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0].split("?")[0].split("#")[0];
  const withoutPort = withoutPath.split(":")[0];
  const normalized = withoutPort.replace(/^www\./, "").trim();

  if (!normalized.includes(".")) {
    return "";
  }

  if (!/^[a-z0-9.-]+$/.test(normalized)) {
    return "";
  }

  if (normalized.startsWith(".") || normalized.endsWith(".")) {
    return "";
  }

  return normalized;
}

function isMissingLogoDomainColumnError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("logo_domain") && message.includes("column");
}

async function upsertDetectedSubscriptionsRows(rows) {
  if (!supabase || !Array.isArray(rows) || rows.length === 0) {
    return { error: null };
  }

  let { error } = await supabase
    .from("detected_subscriptions")
    .upsert(rows, { onConflict: ["user_id", "subscription_id"] });

  if (error && isMissingLogoDomainColumnError(error)) {
    const fallbackRows = rows.map((row) => {
      const { logo_domain, ...rest } = row;
      return rest;
    });

    const retry = await supabase
      .from("detected_subscriptions")
      .upsert(fallbackRows, { onConflict: ["user_id", "subscription_id"] });
    error = retry.error;
  }

  return { error };
}

function detectSubscriptionsFromTransactions(transactions, bankId, sessionId) {
  const debits = transactions.filter((transaction) => {
    const indicator = String(
      transaction.credit_debit_indicator || "",
    ).toUpperCase();
    return indicator === "DBIT";
  });

  const grouped = new Map();
  debits.forEach((transaction) => {
    const merchant = normalizeMerchantName(transaction);
    const key = merchant.toLowerCase();

    if (!grouped.has(key)) {
      grouped.set(key, {
        merchant,
        entries: [],
      });
    }

    grouped.get(key).entries.push(transaction);
  });

  const detected = [];

  grouped.forEach((group) => {
    if (group.entries.length < 2) {
      return;
    }

    const sorted = group.entries
      .map((entry) => ({
        amount: Math.abs(Number(entry.transaction_amount?.amount || 0)),
        currency: String(entry.transaction_amount?.currency || "EUR"),
        date: parseTransactionDate(entry),
      }))
      .filter((entry) => entry.date && entry.amount > 0)
      .sort((a, b) => a.date - b.date);

    if (sorted.length < 2) {
      return;
    }

    const dayDiffs = [];
    for (let index = 1; index < sorted.length; index += 1) {
      const diffMs =
        sorted[index].date.getTime() - sorted[index - 1].date.getTime();
      dayDiffs.push(diffMs / (1000 * 60 * 60 * 24));
    }

    const avgDiff =
      dayDiffs.reduce((sum, value) => sum + value, 0) / dayDiffs.length;
    const uniqueDays = new Set(
      sorted.map((entry) => entry.date.toISOString().slice(0, 10)),
    ).size;

    const cadence =
      detectFrequency(avgDiff) ||
      (sorted.length >= 2 && uniqueDays >= 2
        ? {
            frequency: "Monthly",
            monthlyMultiplier: 1,
            nextDays: 30,
          }
        : null);

    if (!cadence) {
      return;
    }

    const latest = sorted[sorted.length - 1];
    const nextPaymentDate = new Date(latest.date);
    nextPaymentDate.setDate(nextPaymentDate.getDate() + cadence.nextDays);

    detected.push({
      id: `bank-${sessionId}-${group.merchant.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: group.merchant,
      frequency: cadence.frequency,
      amountValue: Number(latest.amount.toFixed(2)),
      currency: latest.currency,
      monthlyAmount: Number(
        (latest.amount * cadence.monthlyMultiplier).toFixed(2),
      ),
      nextPaymentIso: nextPaymentDate.toISOString(),
      source: "bank",
      bankId,
      importedAt: new Date().toISOString(),
    });
  });

  return detected;
}

function getAccountIdentifiers(account) {
  const identifiers = [
    account?.uid,
    account?.resource_id,
    account?.identification_hash,
    ...(Array.isArray(account?.identification_hashes)
      ? account.identification_hashes
      : []),
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return Array.from(new Set(identifiers)).slice(0, 4);
}

function extractTransactionsFromResponse(response) {
  if (Array.isArray(response?.transactions)) {
    return response.transactions;
  }

  if (Array.isArray(response?.transactions?.booked)) {
    const pending = Array.isArray(response?.transactions?.pending)
      ? response.transactions.pending
      : [];
    return [...response.transactions.booked, ...pending];
  }

  const booked = Array.isArray(response?.booked) ? response.booked : [];
  const pending = Array.isArray(response?.pending) ? response.pending : [];

  if (booked.length || pending.length) {
    return [...booked, ...pending];
  }

  return [];
}

function dedupeTransactions(transactions) {
  const seen = new Set();
  const unique = [];

  transactions.forEach((transaction) => {
    const key = [
      transaction?.transaction_id,
      transaction?.entry_reference,
      transaction?.booking_date,
      transaction?.value_date,
      transaction?.transaction_amount?.amount,
      transaction?.transaction_amount?.currency,
    ]
      .map((part) => String(part || ""))
      .join("|");

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(transaction);
    }
  });

  return unique;
}

async function fetchTransactionsForSessionAccounts(accounts, psuHeaders) {
  const allTransactions = [];
  const diagnostics = [];
  const accountCandidates = accounts.slice(0, 5).map((account) => ({
    display: String(
      account?.account_id?.iban || account?.name || account?.uid || "unknown",
    ),
    identifiers: getAccountIdentifiers(account),
  }));

  const dateFrom = new Date();
  dateFrom.setMonth(dateFrom.getMonth() - 6);
  const dateFromString = dateFrom.toISOString().slice(0, 10);
  const dateToString = new Date().toISOString().slice(0, 10);

  for (const account of accountCandidates) {
    let foundForAccount = false;

    for (const identifier of account.identifiers) {
      let continuationKey = "";
      let page = 0;
      let accountTransactions = [];

      const queryModes = [
        { date_from: dateFromString, date_to: dateToString },
        { date_from: dateFromString },
        { booking_status: "both" },
        null,
      ];

      for (const queryMode of queryModes) {
        try {
          do {
            const params = new URLSearchParams();
            if (queryMode?.date_from) {
              params.set("date_from", queryMode.date_from);
            }
            if (queryMode?.date_to) {
              params.set("date_to", queryMode.date_to);
            }
            if (queryMode?.booking_status) {
              params.set("booking_status", queryMode.booking_status);
            }

            if (continuationKey) {
              params.set("continuation_key", continuationKey);
            }

            const suffix = params.toString();
            const encodedIdentifier = encodeURIComponent(identifier);
            const endpoint = suffix
              ? `/accounts/${encodedIdentifier}/transactions?${suffix}`
              : `/accounts/${encodedIdentifier}/transactions`;

            const response = await requestEnableBanking(endpoint, {
              headers: psuHeaders,
            });

            const transactions = extractTransactionsFromResponse(response);
            diagnostics.push({
              account: account.display,
              identifierUsed: identifier,
              queryMode: queryMode || "none",
              responseKeys:
                response && typeof response === "object"
                  ? Object.keys(response).slice(0, 20)
                  : [],
              extractedTransactions: transactions.length,
            });
            accountTransactions.push(...transactions);

            continuationKey = String(response?.continuation_key || "");
            page += 1;
          } while (continuationKey && page < 3);
        } catch (error) {
          diagnostics.push({
            account: account.display,
            identifierUsed: identifier,
            queryMode: queryMode || "none",
            requestError: error?.message || "transaction_fetch_failed",
          });
          continuationKey = "";
          page = 0;
          continue;
        }

        if (accountTransactions.length > 0) {
          break;
        }

        // Reset pagination before trying next query mode.
        continuationKey = "";
        page = 0;
      }

      diagnostics.push({
        account: account.display,
        identifierUsed: identifier,
        transactionsFound: accountTransactions.length,
      });

      if (accountTransactions.length > 0) {
        allTransactions.push(...accountTransactions);
        foundForAccount = true;
        break;
      }
    }

    if (!foundForAccount) {
      diagnostics.push({
        account: account.display,
        identifierUsed: null,
        transactionsFound: 0,
      });
    }
  }

  return {
    transactions: dedupeTransactions(allTransactions),
    diagnostics,
  };
}

function addFakeDataForBank(userRecord, bankId) {
  const templates = fakeSubscriptionsByBank[bankId] || [];
  const existingIds = new Set(userRecord.subscriptions.map((item) => item.id));

  templates.forEach((template) => {
    if (!existingIds.has(template.id)) {
      userRecord.subscriptions.push({
        ...template,
        importedAt: new Date().toISOString(),
      });
    }
  });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, mode: ENABLE_BANKING_MOCK ? "mock" : "live" });
});

app.get("/api/banking/providers", async (req, res) => {
  const country = String(
    req.query.country || ENABLE_BANKING_PROVIDER_COUNTRIES || "",
  );

  try {
    const providers = await getAvailableProviders(country);
    return res.json({
      providers,
      mode: ENABLE_BANKING_MOCK ? "mock" : "live",
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Unable to load bank providers.",
    });
  }
});

app.post("/api/banking/link/start", async (req, res) => {
  const { userId, bankId, appRedirectUrl, aspsp } = req.body || {};

  if (!userId || !bankId || !appRedirectUrl) {
    return res.status(400).json({
      error: "userId, bankId, and appRedirectUrl are required.",
    });
  }

  try {
    const state = `st-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    pendingStates.set(state, {
      userId,
      bankId,
      appRedirectUrl,
      createdAt: Date.now(),
    });

    if (ENABLE_BANKING_MOCK) {
      const authorizationUrl = `${PUBLIC_BASE_URL}/api/banking/mock/authorize?state=${encodeURIComponent(
        state,
      )}`;

      return res.json({ authorizationUrl, state, mode: "mock" });
    }

    const liveConfigErrors = getLiveConfigErrors();
    if (liveConfigErrors.length > 0) {
      return res.status(400).json({
        error: `Enable Banking live mode is misconfigured: ${liveConfigErrors.join(", ")}.`,
      });
    }

    const explicitAspsp =
      aspsp && aspsp.name && aspsp.country
        ? {
            name: String(aspsp.name),
            country: String(aspsp.country),
          }
        : null;

    const resolvedAspsp = explicitAspsp || (await resolveAspsp(bankId));

    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3);

    const startAuthResponse = await requestEnableBanking("/auth", {
      method: "POST",
      body: {
        access: {
          balances: true,
          transactions: true,
          valid_until: validUntil.toISOString(),
        },
        aspsp: resolvedAspsp,
        state,
        redirect_url: ENABLE_BANKING_REDIRECT_URI,
        psu_type: ENABLE_BANKING_PSU_TYPE,
        psu_id: userId,
      },
    });

    if (!startAuthResponse?.url) {
      return res.status(502).json({
        error: "Enable Banking did not return an authorization URL.",
      });
    }

    pendingStates.set(state, {
      ...pendingStates.get(state),
      authorizationId: startAuthResponse.authorization_id || "",
      aspsp: resolvedAspsp,
    });

    return res.json({
      authorizationUrl: startAuthResponse.url,
      state,
      mode: "live",
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Unable to start bank authorization.",
    });
  }
});

app.get("/api/banking/mock/authorize", (req, res) => {
  const { state } = req.query;

  if (!state || typeof state !== "string") {
    return res.status(400).send("Missing state");
  }

  const callbackUrl = `${PUBLIC_BASE_URL}/api/banking/link/callback?state=${encodeURIComponent(
    state,
  )}&code=mock-consent-approved`;

  return res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mock Bank Consent</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; background: #f5f7fb; color: #1a1a1a; }
      .card { max-width: 440px; margin: 40px auto; background: white; border-radius: 14px; padding: 20px; box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
      h1 { font-size: 18px; margin: 0 0 10px; }
      p { color: #555; line-height: 1.45; }
      .btn { display: inline-block; margin-top: 14px; background: #5b3fd9; color: white; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Mock Enable Banking Consent</h1>
      <p>This simulates user bank consent in sandbox mode. Continue to return to the app.</p>
      <a class="btn" href="${callbackUrl}">Approve & return to app</a>
    </div>
  </body>
</html>`);
});

app.get("/api/banking/link/callback", async (req, res) => {
  const state = String(req.query.state || "");
  const code = String(req.query.code || "");
  const callbackError = String(req.query.error || "");
  const callbackErrorDescription = String(req.query.error_description || "");

  const pending = pendingStates.get(state);
  if (!pending) {
    return res.status(400).send("Invalid or expired link state.");
  }

  pendingStates.delete(state);

  const { userId, bankId, appRedirectUrl } = pending;

  if (callbackError) {
    const reason = encodeURIComponent(
      callbackErrorDescription || callbackError || "authorization_failed",
    );
    return res.redirect(`${appRedirectUrl}?status=error&reason=${reason}`);
  }

  if (!code) {
    return res.redirect(`${appRedirectUrl}?status=error&reason=missing_code`);
  }

  try {
    const userRecord = getUserRecord(userId);
    userRecord.linkedBanks.add(bankId);

    if (ENABLE_BANKING_MOCK) {
      addFakeDataForBank(userRecord, bankId);
      return res.redirect(
        `${appRedirectUrl}?status=success&bankId=${encodeURIComponent(bankId)}`,
      );
    }

    const sessionResponse = await requestEnableBanking("/sessions", {
      method: "POST",
      body: { code },
    });

    const sessionId = sessionResponse?.session_id;
    const accounts = Array.isArray(sessionResponse?.accounts)
      ? sessionResponse.accounts
      : [];

    if (!sessionId) {
      return res.redirect(
        `${appRedirectUrl}?status=error&reason=missing_session_id`,
      );
    }

    userRecord.sessions[bankId] = {
      sessionId,
      linkedAt: new Date().toISOString(),
      aspsp: pending.aspsp || null,
      accounts,
    };

    // Save linked bank to Supabase with robust debug logging and timeout
    try {
      console.log("[SUPABASE UPSERT] About to upsert to Supabase");
      const upsertPromise = supabase.from("linked_banks").upsert(
        {
          user_id: userId,
          bank_id: bankId,
          linked_at: new Date().toISOString(),
          session_id: sessionId || null,
          aspsp: pending.aspsp || null,
          accounts: accounts || null,
        },
        { onConflict: ["user_id", "bank_id"] },
      );
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase upsert timed out")), 5000),
      );
      const { data: upsertData, error: upsertError } = await Promise.race([
        upsertPromise,
        timeoutPromise,
      ]);
      console.log(
        "[LINKED_BANKS UPSERT] userId:",
        userId,
        "bankId:",
        bankId,
        "sessionId:",
        sessionId,
      );
      if (upsertError) {
        console.error("[SUPABASE UPSERT ERROR]", upsertError);
      } else {
        console.log("[SUPABASE UPSERT SUCCESS]", upsertData);
      }
    } catch (err) {
      console.error("[SUPABASE UPSERT EXCEPTION]", err);
    }

    const psuHeaders = getPsuHeaders(req);
    let transactions = [];
    try {
      const fetchResult = await fetchTransactionsForSessionAccounts(
        accounts,
        psuHeaders,
      );
      transactions = Array.isArray(fetchResult?.transactions)
        ? fetchResult.transactions
        : [];
      userRecord.transactionFetchDiagnostics = Array.isArray(
        fetchResult?.diagnostics,
      )
        ? fetchResult.diagnostics
        : [];
      userRecord.transactionFetchError = null;
    } catch (error) {
      userRecord.transactionFetchError =
        error?.message || "transaction_fetch_failed";
      userRecord.transactionFetchDiagnostics = [];
      transactions = [];
    }

    userRecord.transactions = transactions;

    const detected = detectSubscriptionsFromTransactions(
      transactions,
      bankId,
      sessionId,
    );

    // Persist detected subscriptions to Supabase
    if (detected.length > 0) {
      // Map detected subscriptions to Supabase schema
      const upsertRows = detected.map((item) => ({
        user_id: userId,
        subscription_id: item.id,
        name: item.name,
        amount: item.amountValue,
        currency: item.currency,
        frequency: item.frequency,
        next_payment: item.nextPaymentIso,
        bank_id: item.bankId,
        logo_domain: normalizeLogoDomain(item.logoDomain || "") || null,
        imported_at: item.importedAt,
        updated_at: new Date().toISOString(),
      }));
      try {
        const { error: detectedError } =
          await upsertDetectedSubscriptionsRows(upsertRows);
        if (detectedError) {
          console.error(
            "[SUPABASE UPSERT DETECTED SUBSCRIPTIONS ERROR]",
            detectedError,
          );
        }
      } catch (err) {
        console.error(
          "[SUPABASE UPSERT DETECTED SUBSCRIPTIONS EXCEPTION]",
          err,
        );
      }
    }

    // No longer update in-memory subscriptions; always load from Supabase
    return res.redirect(
      `${appRedirectUrl}?status=success&bankId=${encodeURIComponent(bankId)}`,
    );
  } catch (error) {
    const reason = encodeURIComponent(
      error?.message || "authorization_exchange_failed",
    );
    return res.redirect(`${appRedirectUrl}?status=error&reason=${reason}`);
  }
});

app.get("/api/banking/links", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) {
    return res
      .status(400)
      .json({ error: "userId query parameter is required." });
  }

  // Fetch linked banks from Supabase
  const { data, error } = await supabase
    .from("linked_banks")
    .select("bank_id")
    .eq("user_id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({
    linkedBankIds: (data || []).map((row) => row.bank_id),
  });
});

// Get detected subscriptions, merged with user edits from Supabase
app.get("/api/banking/subscriptions-detected", async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) {
    return res
      .status(400)
      .json({ error: "userId query parameter is required." });
  }

  // Get all detected subscriptions for the user from Supabase
  const { data, error } = await supabase
    .from("detected_subscriptions")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  // Map to frontend format
  const subscriptions = (data || []).map((row) => {
    const amountValue = Number(row.amount || 0);
    const monthlyMultiplier = getMonthlyMultiplierForFrequency(row.frequency);

    return {
      id: row.subscription_id,
      name: row.name,
      amountValue,
      currency: row.currency,
      frequency: row.frequency,
      nextPaymentIso: row.next_payment,
      bankId: row.bank_id,
      logoDomain: normalizeLogoDomain(row.logo_domain || ""),
      importedAt: row.imported_at,
      updatedAt: row.updated_at,
      monthlyAmount: Number((amountValue * monthlyMultiplier).toFixed(2)),
      source: "bank",
    };
  });
  return res.json({ subscriptions });
});

// Update (upsert) a detected subscription for a user
app.put("/api/banking/subscriptions-detected/:id", async (req, res) => {
  console.log("PUT /api/banking/subscriptions-detected/:id called", {
    params: req.params,
    body: req.body,
    query: req.query,
  });
  const userId = String(req.body.userId || req.query.userId || "");
  const subscriptionId = String(req.params.id || "");
  if (!userId || !subscriptionId) {
    return res
      .status(400)
      .json({ error: "userId and subscription id are required." });
  }
  const { name, amount, currency, frequency, nextPaymentIso } = req.body || {};
  const logoDomain = normalizeLogoDomain(req.body?.logoDomain || "");

  // Upsert into Supabase
  const upsertRows = [
    {
      user_id: userId,
      subscription_id: subscriptionId,
      name,
      amount,
      currency,
      frequency,
      next_payment: nextPaymentIso,
      logo_domain: logoDomain || null,
      updated_at: new Date().toISOString(),
    },
  ];
  const { error } = await upsertDetectedSubscriptionsRows(upsertRows);
  if (error) {
    // Log error for debugging
    console.error("Failed to update detected subscription:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
  return res.json({ success: true });
});

app.get("/api/banking/transactions", (req, res) => {
  const userId = String(req.query.userId || "");
  if (!userId) {
    return res
      .status(400)
      .json({ error: "userId query parameter is required." });
  }

  const record = getUserRecord(userId);
  return res.json({
    transactions: record.transactions,
  });
});

app.get("/api/debug/inspect", (req, res) => {
  const r = getUserRecord(req.query.userId);
  res.json({
    linkedBanks: Array.from(r.linkedBanks || []),
    sessions: r.sessions || {},
    subscriptions: r.subscriptions || [],
    transactions: r.transactions || [],
    transactionFetchError: r.transactionFetchError || null,
    transactionFetchDiagnostics: r.transactionFetchDiagnostics || [],
  });
});

app.delete("/api/banking/links", async (req, res) => {
  const userId = String(req.body.userId || req.query.userId || "");
  const bankId = String(req.body.bankId || req.query.bankId || "");
  if (!userId || !bankId) {
    return res.status(400).json({ error: "userId and bankId are required." });
  }

  const { error } = await supabase
    .from("linked_banks")
    .delete()
    .eq("user_id", userId)
    .eq("bank_id", bankId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ success: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Banking backend running on ${PUBLIC_BASE_URL}`);
  // eslint-disable-next-line no-console
  console.log(`Mode: ${ENABLE_BANKING_MOCK ? "mock" : "live"}`);
  // eslint-disable-next-line no-console
  console.log(
    `Enable Banking callback URL: ${PUBLIC_BASE_URL}/api/banking/link/callback`,
  );
  // eslint-disable-next-line no-console
  console.log(`Health check: ${PUBLIC_BASE_URL}/health`);
});
