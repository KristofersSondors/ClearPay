import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppState, useAppActions } from "../context/AppContext";

export default function EditProfileScreen({ navigation }) {
  const { profile } = useAppState();
  const { updateProfile } = useAppActions();
  const [name, setName] = useState(profile?.name || "Alex Design");
  const [email, setEmail] = useState(profile?.email || "alex@example.com");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "Alex Design");
      setEmail(profile.email || "alex@example.com");
    }
  }, [profile?.name, profile?.email]);

  const handleSave = () => {
    updateProfile({ name, email });
    navigation.goBack();
  };
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Back to Settings</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit Profile</Text>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={{ fontSize: 40 }}>🏔️</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.uploadText}>⬆ Upload New Photo</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.sectionLabel}>🔒 CHANGE PASSWORD</Text>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={currentPw}
              onChangeText={setCurrentPw}
              secureTextEntry
            />
            <Text style={styles.fieldLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={newPw}
              onChangeText={setNewPw}
              secureTextEntry
            />
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={confirmPw}
              onChangeText={setConfirmPw}
              secureTextEntry
            />

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnSave}
                onPress={handleSave}
              >
                <Text style={styles.btnSaveText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F7" },
  container: { flexGrow: 1, padding: 16, paddingTop: 16 },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  backLink: {
    color: "#5B3FD9",
    fontSize: 14,
    marginBottom: 16,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  avatarRow: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  uploadText: { color: "#5B3FD9", fontSize: 13, fontWeight: "500" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  fieldLabel: { fontSize: 13, color: "#444", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1a1a1a",
  },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 24 },
  btnSave: {
    flex: 2,
    backgroundColor: "#5B3FD9",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  btnSaveText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  btnCancelText: { color: "#444", fontSize: 14 },
});
