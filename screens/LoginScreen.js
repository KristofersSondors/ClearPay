import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "../src/lib/asyncStorage";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSupabaseClient, hasSupabaseConfig } from "../src/lib/supabase";
import {
  sanitizeEmail,
  sanitizePassword,
  validateLoginInput,
} from "../src/utils/authSanitization";

WebBrowser.maybeCompleteAuthSession();

function resolveGoogleAuthRedirectUrl() {
  const envRedirect = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim();

  if (Platform.OS === "web" && typeof window !== "undefined") {
    if (envRedirect) {
      return envRedirect;
    }

    return `${window.location.origin}/auth/callback`;
  }

  if (envRedirect && envRedirect.startsWith("clearpay://")) {
    return envRedirect;
  }

  return "clearpay://auth/callback";
}

function parseCallbackParams(callbackUrl = "") {
  const params = new URLSearchParams();

  if (!callbackUrl) {
    return params;
  }

  try {
    const parsedUrl = new URL(callbackUrl);

    parsedUrl.searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    if (parsedUrl.hash?.startsWith("#")) {
      const hashParams = new URLSearchParams(parsedUrl.hash.slice(1));
      hashParams.forEach((value, key) => {
        params.set(key, value);
      });
    }

    return params;
  } catch {
    // Fallback for malformed URLs so we can still inspect callback params.
    const [withoutHash, hashPart = ""] = callbackUrl.split("#");
    const queryPart = withoutHash.split("?")[1] || "";

    const queryParams = new URLSearchParams(queryPart);
    queryParams.forEach((value, key) => {
      params.set(key, value);
    });

    const hashParams = new URLSearchParams(hashPart);
    hashParams.forEach((value, key) => {
      params.set(key, value);
    });

    return params;
  }
}

export default function LoginScreen({ navigation }) {
  const REMEMBER_EMAIL_KEY = "clearpay_remembered_email";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleAuthInProgressRef = useRef(false);

  const redirectTo = resolveGoogleAuthRedirectUrl();

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
        if (savedEmail) {
          setEmail(savedEmail);
          setRemember(true);
        }
      } catch {
        // Ignore storage errors to avoid blocking login UI.
      }
    };

    loadRememberedEmail();
  }, []);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Welcome");
  };

  const persistRememberedEmail = async (shouldRemember, cleanEmail) => {
    try {
      if (shouldRemember) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, cleanEmail);
      } else {
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch {
      // Ignore storage errors so authentication flow still succeeds.
    }
  };

  const handleLogin = async () => {
    const cleanEmail = sanitizeEmail(email);
    const cleanPassword = sanitizePassword(password);

    setEmail(cleanEmail);

    const validationError = validateLoginInput(cleanEmail, cleanPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!hasSupabaseConfig) {
      setError(
        "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    try {
      setError("");
      setLoading(true);

      const supabase = getSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (signInError) {
        setError(signInError.message || "Unable to sign in. Please try again.");
        return;
      }

      await persistRememberedEmail(remember, cleanEmail);

      navigation.navigate("Main");
    } catch {
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleAuthInProgressRef.current) {
      return;
    }

    if (!hasSupabaseConfig) {
      setError(
        "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    try {
      googleAuthInProgressRef.current = true;
      setError("");
      setLoading(true);

      const supabase = getSupabaseClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (oauthError || !data?.url) {
        setError(oauthError?.message || "Unable to start Google sign-in.");
        return;
      }

      const authResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (authResult.type !== "success" || !authResult.url) {
        if (authResult.type !== "cancel" && authResult.type !== "dismiss") {
          setError("Google sign-in was not completed.");
        }
        return;
      }

      const callbackParams = parseCallbackParams(authResult.url);
      const callbackError =
        callbackParams.get("error_description") || callbackParams.get("error");

      if (callbackError) {
        setError(callbackError);
        return;
      }

      const authCode = callbackParams.get("code");

      if (authCode && typeof authCode === "string") {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(authCode);

        if (exchangeError) {
          setError(exchangeError.message || "Unable to finish Google sign-in.");
          return;
        }
      } else {
        const accessToken = callbackParams.get("access_token");
        const refreshToken = callbackParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          setError(
            "Google sign-in callback did not include a valid session. Please try again.",
          );
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(sessionError.message || "Unable to finish Google sign-in.");
          return;
        }
      }

      setTimeout(() => {
        navigation.replace("Main");
      }, 150);
    } catch {
      setError("Something went wrong during Google sign-in. Please try again.");
    } finally {
      googleAuthInProgressRef.current = false;
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.logoBox}>
            <Image
              source={require("../Logo.png")}
              style={{ width: 34, height: 34 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Sign in to ClearPay</Text>
          <Text style={styles.subtitle}>
            Manage your subscriptions with confidence
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="alex@example.com"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) {
                  setError("");
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (error) {
                  setError("");
                }
              }}
              secureTextEntry
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setRemember(!remember)}
              >
                <View
                  style={[styles.checkbox, remember && styles.checkboxChecked]}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading ? "Signing in..." : "Sign in"}
              </Text>
            </TouchableOpacity>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.divider} />
            </View>
            <TouchableOpacity
              style={[styles.googleBtn, loading && styles.btnDisabled]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Text style={styles.googleG}>G </Text>
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0F0F5" },
  container: { flexGrow: 1, alignItems: "center", padding: 24, paddingTop: 40 },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  backButtonText: { fontSize: 14, color: "#5B3FD9", fontWeight: "500" },
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
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a1a", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 13, color: "#444", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1a1a1a",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  errorText: { marginTop: 10, color: "#D93025", fontSize: 13 },
  checkRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: "#999",
    borderRadius: 3,
    marginRight: 8,
  },
  checkboxChecked: { backgroundColor: "#5B3FD9", borderColor: "#5B3FD9" },
  rememberText: { fontSize: 13, color: "#444" },
  forgotText: { fontSize: 13, color: "#5B3FD9", fontWeight: "600" },
  btnPrimary: {
    backgroundColor: "#5B3FD9",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#E5E5E5" },
  dividerText: { marginHorizontal: 10, color: "#999", fontSize: 13 },
  googleBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  googleG: { fontSize: 16, fontWeight: "700", color: "#4285F4" },
  googleText: { fontSize: 14, color: "#333", fontWeight: "500" },
});
