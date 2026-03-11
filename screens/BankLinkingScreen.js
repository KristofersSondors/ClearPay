import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppState, useAppActions } from "../context/AppContext";

export default function BankLinkingScreen({ navigation, route }) {
  const { banks } = useAppState();
  const { toggleBank } = useAppActions();
  const showSignupSuccess = Boolean(route?.params?.signupSuccess);

  const connectedCount = banks.filter((b) => b.connected).length;
  const canProceed = connectedCount > 0;

  const handleFinish = () => {
    navigation.navigate("Main");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressBar}>
          <View style={[styles.seg, styles.segActive]} />
          <View style={[styles.seg, styles.segActive]} />
          <View style={styles.seg} />
        </View>

        <View style={styles.logoBox}>
          <Text style={styles.logoText}>C</Text>
        </View>
        <Text style={styles.title}>Link your bank accounts</Text>
        <Text style={styles.subtitle}>
          Select your bank to securely connect and automatically import
          subscriptions.
        </Text>

        {showSignupSuccess ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>
              Profile created successfully. Now link your bank account.
            </Text>
          </View>
        ) : null}

        {banks.map((bank) => {
          const isConnected = bank.connected;
          return (
            <TouchableOpacity
              key={bank.id}
              style={[styles.bankRow, isConnected && styles.bankRowConnected]}
              onPress={() => toggleBank(bank.id)}
            >
              <Text style={[styles.bankName, { color: bank.color }]}>
                {bank.name}
              </Text>
              {isConnected ? (
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedText}>✓ Connected</Text>
                </View>
              ) : (
                <Text style={styles.connectText}>Connect</Text>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.btnPrimary, canProceed && styles.btnActive]}
          onPress={() => canProceed && handleFinish()}
        >
          <Text style={styles.btnText}>
            {canProceed ? "Finish & Go to Dashboard" : "Link at least 1 bank"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0F0F5" },
  container: { flexGrow: 1, alignItems: "center", padding: 24, paddingTop: 20 },
  progressBar: {
    flexDirection: "row",
    width: "100%",
    gap: 6,
    marginBottom: 24,
  },
  seg: { flex: 1, height: 4, backgroundColor: "#DDD", borderRadius: 2 },
  segActive: { backgroundColor: "#5B3FD9" },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#5B3FD9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  successBanner: {
    width: "100%",
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  successBannerText: { color: "#166534", fontSize: 13, fontWeight: "600" },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
  },
  bankRowConnected: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  bankName: { fontSize: 16, fontWeight: "600" },
  connectText: { fontSize: 13, color: "#666" },
  connectedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  connectedText: { color: "#16A34A", fontSize: 13, fontWeight: "600" },
  btnPrimary: {
    backgroundColor: "#A78BCA",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    marginBottom: 14,
  },
  btnActive: { backgroundColor: "#5B3FD9" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
