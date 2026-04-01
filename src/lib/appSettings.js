import AsyncStorage from "./asyncStorage";

const NOTIFICATION_SETTINGS_KEY = "clearpay_notification_settings";
const PRIVACY_SECURITY_SETTINGS_KEY = "clearpay_privacy_security_settings";

const DEFAULT_NOTIFICATION_SETTINGS = {
  paymentReminders: true,
  productUpdates: false,
};

const DEFAULT_PRIVACY_SECURITY_SETTINGS = {
  biometricLock: false,
  hideAmountsOnDashboard: false,
  shareAnonymousAnalytics: true,
};

function mergeWithDefaults(defaults, parsed) {
  return {
    ...defaults,
    ...(parsed && typeof parsed === "object" ? parsed : {}),
  };
}

export async function getNotificationSettings() {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return mergeWithDefaults(DEFAULT_NOTIFICATION_SETTINGS, parsed);
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function setNotificationSettings(settings) {
  const merged = mergeWithDefaults(DEFAULT_NOTIFICATION_SETTINGS, settings);
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}

export async function getPrivacySecuritySettings() {
  try {
    const raw = await AsyncStorage.getItem(PRIVACY_SECURITY_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return mergeWithDefaults(DEFAULT_PRIVACY_SECURITY_SETTINGS, parsed);
  } catch {
    return DEFAULT_PRIVACY_SECURITY_SETTINGS;
  }
}

export async function setPrivacySecuritySettings(settings) {
  const merged = mergeWithDefaults(DEFAULT_PRIVACY_SECURITY_SETTINGS, settings);
  await AsyncStorage.setItem(
    PRIVACY_SECURITY_SETTINGS_KEY,
    JSON.stringify(merged),
  );
  return merged;
}
