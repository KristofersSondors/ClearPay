import React, { useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { getSupabaseClient, hasSupabaseConfig } from "../src/lib/supabase";
import {
  sanitizeName,
  sanitizeNameInput,
  sanitizeEmail,
  sanitizePassword,
  validateSignupInputAll,
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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const googleAuthInProgressRef = useRef(false);

  const redirectTo = resolveGoogleAuthRedirectUrl();

  const isEmailAlreadyInUse = (authError) => {
    const code = authError?.code?.toLowerCase?.() || "";
    const message = authError?.message?.toLowerCase?.() || "";

    return (
      code.includes("user_already_exists") ||
      code.includes("email_exists") ||
      message.includes("already") ||
      message.includes("registered") ||
      message.includes("exists") ||
      message.includes("duplicate")
    );
  };

  const isObfuscatedExistingUserResponse = (data) => {
    const identities = data?.user?.identities;
    return Array.isArray(identities) && identities.length === 0;
  };

  const handleSignUp = async () => {
    const cleanName = sanitizeName(name);
    const cleanEmail = sanitizeEmail(email);
    const cleanPassword = sanitizePassword(password);
    const cleanConfirm = sanitizePassword(confirm);

    setName(cleanName);
    setEmail(cleanEmail);

    const validationErrors = validateSignupInputAll({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      confirmPassword: cleanConfirm,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!hasSupabaseConfig) {
      setErrors([
        "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
      ]);
      return;
    }

    try {
      setErrors([]);
      setLoading(true);

      const supabase = getSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (signUpError) {
        if (isEmailAlreadyInUse(signUpError)) {
          setErrors(["This email is already in use. Please sign in instead."]);
          return;
        }

        setErrors([
          signUpError.message || "Unable to create account. Please try again.",
        ]);
        return;
      }

      if (isObfuscatedExistingUserResponse(data)) {
        setErrors(["This email is already in use. Please sign in instead."]);
        return;
      }

      navigation.navigate("BankLinking", {
        signupSuccess: true,
      });
    } catch {
      setErrors([
        "Something went wrong while creating your account. Please try again.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleAuthInProgressRef.current) {
      return;
    }

    if (!hasSupabaseConfig) {
      setErrors([
        "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
      ]);
      return;
    }

    try {
      googleAuthInProgressRef.current = true;
      setErrors([]);
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
        setErrors([oauthError?.message || "Unable to start Google sign-in."]);
        return;
      }

      const authResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (authResult.type !== "success" || !authResult.url) {
        if (authResult.type !== "cancel" && authResult.type !== "dismiss") {
          setErrors(["Google sign-in was not completed."]);
        }
        return;
      }

      const callbackParams = parseCallbackParams(authResult.url);
      const callbackError =
        callbackParams.get("error_description") || callbackParams.get("error");

      if (callbackError) {
        setErrors([callbackError]);
        return;
      }

      const authCode = callbackParams.get("code");

      if (authCode && typeof authCode === "string") {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(authCode);

        if (exchangeError) {
          setErrors([
            exchangeError.message || "Unable to finish Google sign-in.",
          ]);
          return;
        }
      } else {
        const accessToken = callbackParams.get("access_token");
        const refreshToken = callbackParams.get("refresh_token");

        if (!accessToken || !refreshToken) {
          setErrors([
            "Google sign-in callback did not include a valid session. Please try again.",
          ]);
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setErrors([
            sessionError.message || "Unable to finish Google sign-in.",
          ]);
          return;
        }
      }

      setTimeout(() => {
        navigation.replace("BankLinking", {
          signupSuccess: true,
        });
      }, 150);
    } catch {
      setErrors(["Something went wrong during Google sign-in. Please try again."]);
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Welcome")}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>

          <View style={styles.logoBox}>
            <Image
              source={require("../Logo.png")}
              style={{ width: 34, height: 34 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Create your ClearPay account</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Alex Johnson"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={(value) => {
                setName(sanitizeNameInput(value));
                if (errors.length) {
                  setErrors([]);
                }
              }}
            />
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="alex@example.com"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (errors.length) {
                  setErrors([]);
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
                if (errors.length) {
                  setErrors([]);
                }
              }}
              secureTextEntry
            />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={confirm}
              onChangeText={(value) => {
                setConfirm(value);
                if (errors.length) {
                  setErrors([]);
                }
              }}
              secureTextEntry
            />

            {errors.length > 0 ? (
              <View style={styles.errorList}>
                {errors.map((message) => (
                  <Text key={message} style={styles.errorText}>
                    {`• ${message}`}
                  </Text>
                ))}
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading
                  ? "Creating account..."
                  : "Next: Link Your Bank Accounts"}
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

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>
              Already have an account?{" "}
              <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0F0F5" },
  container: { flexGrow: 1, alignItems: "center", padding: 24, paddingTop: 20 },
  backButton: { alignSelf: "flex-start", marginBottom: 12 },
  backButtonText: { fontSize: 14, color: "#5B3FD9", fontWeight: "500" },
  progressBar: {
    flexDirection: "row",
    width: "100%",
    gap: 6,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
  },
  progressActive: { backgroundColor: "#5B3FD9" },
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
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
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
  errorList: { marginTop: 10, gap: 4 },
  errorText: { color: "#D93025", fontSize: 13 },
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
  loginLink: { fontSize: 14, color: "#666" },
  loginBold: { color: "#5B3FD9", fontWeight: "700" },
});
