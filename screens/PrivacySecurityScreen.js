import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getPrivacySecuritySettings,
  setPrivacySecuritySettings,
} from "../src/lib/appSettings";
import {
  TOGGLE_TRACK_COLOR,
  getToggleThumbColor,
} from "../src/lib/toggleBehavior";

export default function PrivacySecurityScreen({ navigation }) {
  const [settings, setSettings] = useState({
    biometricLock: false,
    hideAmountsOnDashboard: false,
    shareAnonymousAnalytics: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await getPrivacySecuritySettings();
      setSettings(saved);
    };

    loadSettings();
  }, []);

  const updateSetting = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await setPrivacySecuritySettings(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Privacy & Security</Text>
        <Text style={styles.pageSubTitle}>
          Control how your information is protected and used.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Biometric Lock</Text>
              <Text style={styles.rowDescription}>
                Require Face ID/Touch ID to open the app.
              </Text>
            </View>
            <Switch
              value={settings.biometricLock}
              onValueChange={(value) => updateSetting("biometricLock", value)}
              trackColor={TOGGLE_TRACK_COLOR}
              thumbColor={getToggleThumbColor(settings.biometricLock)}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Hide Amounts on Dashboard</Text>
              <Text style={styles.rowDescription}>
                Blur spend values until manually revealed.
              </Text>
            </View>
            <Switch
              value={settings.hideAmountsOnDashboard}
              onValueChange={(value) =>
                updateSetting("hideAmountsOnDashboard", value)
              }
              trackColor={TOGGLE_TRACK_COLOR}
              thumbColor={getToggleThumbColor(settings.hideAmountsOnDashboard)}
            />
          </View>

          <View style={styles.rowLast}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Share Anonymous Analytics</Text>
              <Text style={styles.rowDescription}>
                Help improve app quality with anonymous usage data.
              </Text>
            </View>
            <Switch
              value={settings.shareAnonymousAnalytics}
              onValueChange={(value) =>
                updateSetting("shareAnonymousAnalytics", value)
              }
              trackColor={TOGGLE_TRACK_COLOR}
              thumbColor={getToggleThumbColor(settings.shareAnonymousAnalytics)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F7" },
  container: { flex: 1, backgroundColor: "#F5F5F7", paddingHorizontal: 16 },
  content: { paddingTop: 24, paddingBottom: 40 },
  backButton: { alignSelf: "flex-start", marginBottom: 8 },
  backButtonText: {
    color: "#5B3FD9",
    fontSize: 14,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  pageSubTitle: { fontSize: 13, color: "#666", marginBottom: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 10,
  },
  rowLast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 10,
  },
  rowTextContainer: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  rowDescription: { fontSize: 12, color: "#777", marginTop: 2, lineHeight: 17 },
});
