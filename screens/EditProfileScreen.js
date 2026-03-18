import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { requireOptionalNativeModule } from "expo-modules-core";
import {
  getAuthenticatedProfile,
  getSupabaseClient,
  hasSupabaseConfig,
  uploadAuthenticatedProfilePhoto,
  updateAuthenticatedProfile,
} from "../src/lib/supabase";
import {
  sanitizeEmail,
  sanitizeName,
  sanitizeNameInput,
  sanitizePassword,
  validatePasswordChangeInput,
} from "../src/utils/authSanitization";

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [avatarUri, setAvatarUri] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [avatarPath, setAvatarPath] = useState("");
  const [hasPendingAvatarUpload, setHasPendingAvatarUpload] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!hasSupabaseConfig) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }

      const { profile, error: profileError } = await getAuthenticatedProfile();

      if (profileError) {
        setError(profileError.message || "Unable to load your profile.");
        setLoading(false);
        return;
      }

      if (!profile) {
        setError("No authenticated user was found.");
        setLoading(false);
        return;
      }

      setName(profile.name || "");
      setEmail(profile.email || "");
      setAuthEmail(profile.email || "");
      setAvatarUri(profile.avatarUrl || "");
      setAvatarLoadFailed(false);
      setAvatarPath(profile.avatarPath || "");
      setHasPendingAvatarUpload(false);
      setError("");
      setLoading(false);
    };

    loadProfile();
  }, []);

  const getImagePickerModule = async () => {
    const imagePickerNativeModule = requireOptionalNativeModule(
      "ExponentImagePicker",
    );

    if (!imagePickerNativeModule) {
      Alert.alert(
        "Photo upload unavailable",
        "Image picker native module is not available in this build yet. Rebuild the iOS app (npx expo run:ios).",
      );
      return null;
    }

    try {
      const imagePickerModule = await import("expo-image-picker");
      return imagePickerModule;
    } catch {
      Alert.alert(
        "Photo upload unavailable",
        "This iOS build does not include the image picker native module yet. Rebuild the app after installing the dependency.",
      );
      return null;
    }
  };

  const handlePickPhoto = async () => {
    if (loading || saving) {
      return;
    }

    try {
      const ImagePicker = await getImagePickerModule();

      if (!ImagePicker) {
        return;
      }

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Photo access needed",
          "Allow photo library access to upload a profile picture.",
        );
        return;
      }

      Keyboard.dismiss();

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const selectedAsset = result.assets?.[0];

      if (!selectedAsset?.uri) {
        setError("Unable to read the selected photo.");
        return;
      }

      setAvatarUri(selectedAsset.uri);
      setAvatarLoadFailed(false);
      setHasPendingAvatarUpload(true);
      setError("");
    } catch {
      setError("Something went wrong while selecting a photo.");
    }
  };

  const handleSave = async () => {
    const cleanName = sanitizeName(name);
    const cleanEmail = sanitizeEmail(email);
    const cleanCurrentPassword = sanitizePassword(currentPw);
    const cleanNewPassword = sanitizePassword(newPw);
    const cleanConfirmPassword = sanitizePassword(confirmPw);
    const passwordChangeRequested =
      Boolean(cleanCurrentPassword) ||
      Boolean(cleanNewPassword) ||
      Boolean(cleanConfirmPassword);
    const emailChanged = cleanEmail !== authEmail;

    setName(cleanName);
    setEmail(cleanEmail);

    if (!cleanName || !cleanEmail) {
      setError("Name and email are required.");
      return;
    }

    const passwordValidationErrors = validatePasswordChangeInput({
      currentPassword: cleanCurrentPassword,
      newPassword: cleanNewPassword,
      confirmPassword: cleanConfirmPassword,
    });

    if (passwordValidationErrors.length > 0) {
      setError(passwordValidationErrors[0]);
      return;
    }

    try {
      setError("");
      setSaving(true);

      let nextAvatarPath = avatarPath;
      let photoUploadWarning = "";

      if (passwordChangeRequested) {
        const supabase = getSupabaseClient();
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: cleanCurrentPassword,
        });

        if (reauthError) {
          setError("Current password is incorrect.");
          return;
        }
      }

      if (hasPendingAvatarUpload) {
        const {
          avatarUrl,
          avatarPath: uploadedAvatarPath,
          error: uploadError,
        } = await uploadAuthenticatedProfilePhoto(avatarUri);

        if (uploadError) {
          photoUploadWarning =
            uploadError.message || "Unable to upload your profile photo.";

          if (uploadedAvatarPath) {
            // Upload can succeed while signed URL creation fails; still persist the new path.
            nextAvatarPath = uploadedAvatarPath;
            setHasPendingAvatarUpload(false);
          }
        } else {
          setAvatarUri(avatarUrl || avatarUri);
          setAvatarLoadFailed(false);
          nextAvatarPath = uploadedAvatarPath;
          setHasPendingAvatarUpload(false);
        }
      }

      const { error: updateError } = await updateAuthenticatedProfile({
        name: cleanName,
        email: cleanEmail,
        password: cleanNewPassword || undefined,
        avatarPath: nextAvatarPath || undefined,
      });

      if (updateError) {
        setError(updateError.message || "Unable to save your profile.");
        return;
      }

      const baseMessage = passwordChangeRequested
        ? "Your password was changed successfully."
        : emailChanged
          ? "Your profile changes have been saved. Check your email if Supabase asks you to confirm the new address."
          : hasPendingAvatarUpload && !photoUploadWarning
            ? "Your profile photo and account details have been saved."
            : "Your profile changes have been saved.";

      Alert.alert(
        "Profile updated",
        photoUploadWarning
          ? `${baseMessage}\n\nPhoto upload warning: ${photoUploadWarning}`
          : baseMessage,
      );

      if (passwordChangeRequested) {
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }

      setAuthEmail(cleanEmail);
      navigation.goBack();
    } catch {
      setError("Something went wrong while saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Back to Settings</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Edit Profile</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit Profile</Text>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                {avatarUri && !avatarLoadFailed ? (
                  <Image
                    key={avatarUri}
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <Text style={{ fontSize: 40 }}>🏔️</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handlePickPhoto}
                disabled={loading || saving}
              >
                <Text style={styles.uploadText}>
                  {hasPendingAvatarUpload
                    ? "⬆ Photo Selected"
                    : "⬆ Upload New Photo"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(value) => {
                setName(sanitizeNameInput(value));
                if (error) {
                  setError("");
                }
              }}
              editable={!loading && !saving}
            />
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) {
                  setError("");
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !saving}
            />

            <Text style={styles.sectionLabel}>🔒 CHANGE PASSWORD</Text>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={currentPw}
              onChangeText={(value) => {
                setCurrentPw(value);
                if (error) {
                  setError("");
                }
              }}
              secureTextEntry
              editable={!loading && !saving}
            />
            <Text style={styles.fieldLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={newPw}
              onChangeText={(value) => {
                setNewPw(value);
                if (error) {
                  setError("");
                }
              }}
              secureTextEntry
              editable={!loading && !saving}
            />
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={confirmPw}
              onChangeText={(value) => {
                setConfirmPw(value);
                if (error) {
                  setError("");
                }
              }}
              secureTextEntry
              editable={!loading && !saving}
            />

            {loading ? (
              <Text style={styles.infoText}>Loading your profile...</Text>
            ) : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[
                  styles.btnSave,
                  (loading || saving) && styles.btnDisabled,
                ]}
                onPress={handleSave}
                disabled={loading || saving}
              >
                <Text style={styles.btnSaveText}>
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => navigation.goBack()}
                disabled={saving}
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
    marginBottom: 12,
  },
  backLink: {
    color: "#5B3FD9",
    fontSize: 14,
    marginBottom: 6,
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
  avatarImage: { width: "100%", height: "100%" },
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
  infoText: { fontSize: 13, color: "#666", marginTop: 12 },
  errorText: { fontSize: 13, color: "#DC2626", marginTop: 12 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 24 },
  btnSave: {
    flex: 2,
    backgroundColor: "#5B3FD9",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
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
