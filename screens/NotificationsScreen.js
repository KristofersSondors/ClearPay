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
  getNotificationSettings,
  setNotificationSettings,
} from "../src/lib/appSettings";
import {
  TOGGLE_TRACK_COLOR,
  getToggleThumbColor,
} from "../src/lib/toggleBehavior";

export default function NotificationsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    paymentReminders: true,
    productUpdates: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await getNotificationSettings();
      setSettings(saved);
    };

    loadSettings();
  }, []);

  const updateSetting = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await setNotificationSettings(next);
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

        <Text style={styles.pageTitle}>Notifications</Text>
        <Text style={styles.pageSubTitle}>
          Manage what alerts you receive from ClearPay.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Payment Reminders</Text>
              <Text style={styles.rowDescription}>
                Alerts before upcoming subscription payments.
              </Text>
            </View>
            <Switch
              value={settings.paymentReminders}
              onValueChange={(value) =>
                updateSetting("paymentReminders", value)
              }
              trackColor={TOGGLE_TRACK_COLOR}
              thumbColor={getToggleThumbColor(settings.paymentReminders)}
            />
          </View>

          <View style={styles.rowLast}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Product Updates</Text>
              <Text style={styles.rowDescription}>
                New features, tips, and app announcements.
              </Text>
            </View>
            <Switch
              value={settings.productUpdates}
              onValueChange={(value) => updateSetting("productUpdates", value)}
              trackColor={TOGGLE_TRACK_COLOR}
              thumbColor={getToggleThumbColor(settings.productUpdates)}
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
