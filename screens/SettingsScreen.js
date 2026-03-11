import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAuthenticatedProfile,
  getSupabaseClient,
  hasSupabaseConfig,
} from "../src/lib/supabase";

const BANKS = [
  { id: "swedbank", name: "Swedbank", color: "#FF6600" },
  { id: "seb", name: "S|E|B", color: "#000" },
  { id: "revolut", name: "Revolut", color: "#000" },
  { id: "luminor", name: "Luminor", color: "#1A3A5C" },
];

export default function SettingsScreen({ navigation }) {
  const [connected, setConnected] = useState(["swedbank"]);
  const [profile, setProfile] = useState({
    name: "Your Profile",
    email: "Sign in to load your account",
    plan: "Free Plan",
    avatarUrl: "",
  });
  const [profileError, setProfileError] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const toggle = (id) =>
    setConnected((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );

  useEffect(() => {
    const loadProfile = async () => {
      if (!hasSupabaseConfig) {
        setProfileError("Supabase is not configured.");
        return;
      }

      const { profile: authenticatedProfile, error } =
        await getAuthenticatedProfile();

      if (error) {
        setProfileError(
          error.message || "Unable to load your account details.",
        );
        return;
      }

      if (!authenticatedProfile) {
        setProfileError("No authenticated user was found.");
        return;
      }

      setProfile(authenticatedProfile);
      setAvatarLoadFailed(false);
      setProfileError("");
    };

    loadProfile();

    const unsubscribe = navigation.addListener("focus", loadProfile);

    return unsubscribe;
  }, [navigation]);

  const handleSignOut = async () => {
    if (!hasSupabaseConfig) {
      navigation.replace("Welcome");
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Sign out failed", error.message || "Please try again.");
      return;
    }

    navigation.replace("Welcome");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {profile.avatarUrl && !avatarLoadFailed ? (
                <Image
                  key={profile.avatarUrl}
                  source={{ uri: profile.avatarUrl }}
                  style={styles.avatarImage}
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <Text style={{ fontSize: 28 }}>🏔️</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planText}>{profile.plan}</Text>
              </View>
            </View>
          </View>
          {profileError ? (
            <Text style={styles.profileError}>{profileError}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Connected Banks */}
        <Text style={styles.sectionLabel}>Connected Banks</Text>
        <View style={styles.card}>
          <Text style={styles.bankDesc}>
            Link your bank accounts to automatically detect subscriptions and
            recurring payments. We use bank-level 256-bit encryption.
          </Text>
          {BANKS.map((bank) => {
            const isConnected = connected.includes(bank.id);
            return (
              <TouchableOpacity
                key={bank.id}
                style={[styles.bankRow, isConnected && styles.bankRowConnected]}
                onPress={() => toggle(bank.id)}
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
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          {[
            { icon: "💳", label: "Currency & Region", value: "USD ($)" },
            { icon: "🔔", label: "Notifications", value: "" },
            { icon: "🔒", label: "Privacy & Security", value: "" },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.prefRow}>
              <Text style={styles.prefIcon}>{item.icon}</Text>
              <Text style={styles.prefLabel}>{item.label}</Text>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                {item.value ? (
                  <Text style={styles.prefValue}>{item.value}</Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>⇥ Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.2.0 · Build 4829</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F7" },
  container: { flex: 1, backgroundColor: "#F5F5F7", paddingHorizontal: 16 },
  contentContainer: { paddingTop: 24, paddingBottom: 40 },
  backButton: { alignSelf: "flex-start", marginBottom: 6 },
  backButtonText: {
    color: "#5B3FD9",
    fontSize: 14,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  profileName: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  profileEmail: { fontSize: 13, color: "#888", marginTop: 2 },
  profileError: { fontSize: 12, color: "#DC2626", marginBottom: 12 },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE9FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  planText: { fontSize: 12, color: "#5B3FD9", fontWeight: "600" },
  editBtn: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  editBtnText: { fontSize: 14, color: "#444", fontWeight: "500" },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
    marginTop: 4,
  },
  bankDesc: { fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 18 },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  bankRowConnected: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  bankName: { fontSize: 15, fontWeight: "600" },
  connectText: { fontSize: 13, color: "#666" },
  connectedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  connectedText: { color: "#16A34A", fontSize: 13, fontWeight: "600" },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  prefIcon: { fontSize: 18, marginRight: 12 },
  prefLabel: { fontSize: 14, color: "#1a1a1a" },
  prefValue: { fontSize: 13, color: "#888" },
  chevron: { fontSize: 20, color: "#ccc", marginLeft: 6 },
  signOutBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  signOutText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  version: { textAlign: "center", fontSize: 12, color: "#aaa" },
});
