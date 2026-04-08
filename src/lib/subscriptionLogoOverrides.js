import AsyncStorage from "./asyncStorage";
import { getSupabaseClient, hasSupabaseConfig } from "./supabase";
import { resolveSubscriptionLogoDomain, normalizeLogoDomain } from "./subscriptionLogos";

const LOGO_OVERRIDES_KEY_PREFIX = "clearpay_subscription_logo_overrides";
const ANONYMOUS_SCOPE = "anonymous";

function parseOverrides(rawValue) {
  try {
    const parsed = rawValue ? JSON.parse(rawValue) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

async function resolveScopeId() {
  if (!hasSupabaseConfig) {
    return ANONYMOUS_SCOPE;
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return ANONYMOUS_SCOPE;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user?.id) {
      return ANONYMOUS_SCOPE;
    }

    return data.user.id;
  } catch {
    return ANONYMOUS_SCOPE;
  }
}

function getScopedOverridesKey(scopeId) {
  return `${LOGO_OVERRIDES_KEY_PREFIX}:${scopeId}`;
}

export async function getSubscriptionLogoOverrides() {
  const scopeId = await resolveScopeId();
  const key = getScopedOverridesKey(scopeId);

  const raw = await AsyncStorage.getItem(key);
  const parsed = parseOverrides(raw);
  const sanitized = {};

  Object.entries(parsed).forEach(([subscriptionId, value]) => {
    const domain = normalizeLogoDomain(value);
    if (subscriptionId && domain) {
      sanitized[subscriptionId] = domain;
    }
  });

  return sanitized;
}

async function saveSubscriptionLogoOverrides(nextOverrides) {
  const scopeId = await resolveScopeId();
  const key = getScopedOverridesKey(scopeId);
  await AsyncStorage.setItem(key, JSON.stringify(nextOverrides || {}));
}

export async function setSubscriptionLogoOverride(subscriptionId, logoDomain) {
  const normalizedDomain = normalizeLogoDomain(logoDomain);
  if (!subscriptionId || !normalizedDomain) {
    return false;
  }

  const overrides = await getSubscriptionLogoOverrides();
  overrides[subscriptionId] = normalizedDomain;
  await saveSubscriptionLogoOverrides(overrides);
  return true;
}

export async function clearSubscriptionLogoOverride(subscriptionId) {
  if (!subscriptionId) {
    return false;
  }

  const overrides = await getSubscriptionLogoOverrides();
  delete overrides[subscriptionId];
  await saveSubscriptionLogoOverrides(overrides);
  return true;
}

export function resolveLogoDomainForSubscription(subscription, logoOverrides = {}) {
  if (!subscription) {
    return "";
  }

  const overrideDomain = normalizeLogoDomain(logoOverrides?.[subscription.id] || "");
  return resolveSubscriptionLogoDomain({
    name: subscription.name || "",
    logoDomain: overrideDomain || subscription.logoDomain || subscription.logo_domain || "",
  });
}

