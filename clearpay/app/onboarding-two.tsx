import { router } from "expo-router";
import { Image } from "expo-image";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function OnboardingTwoScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoBox}>
          <Image
            source={require("@/assets/images/ClearPay_logo.png")}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>

        <Text style={styles.title}>Sign in to ClearPay</Text>
        <Text style={styles.subtitle}>
          Manage your subscriptions with confidence
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            defaultValue="toms@irge.com"
            placeholder="Enter email"
            placeholderTextColor="#A3AABD"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, styles.fieldTopSpace]}>Password</Text>
          <TextInput
            style={styles.input}
            defaultValue="••••••••"
            placeholder="Enter password"
            placeholderTextColor="#A3AABD"
            secureTextEntry
          />

          <View style={styles.rememberRow}>
            <View style={styles.rememberLeft}>
              <View style={styles.checkbox} />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </View>

          <Pressable
            style={styles.signInButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.signInButtonText}>Sign in</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          <Pressable style={styles.googleButton}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Sign in with Google</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.switchAuth}
          onPress={() => router.push("./onboarding-three")}
        >
          <Text style={styles.switchAuthText}>
            Don&apos;t have an account?{" "}
          </Text>
          <Text style={styles.switchAuthLink}>Register</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F8",
    paddingTop: 54,
    paddingHorizontal: 14,
  },
  headerText: {
    color: "#666A76",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },
  container: {
    alignItems: "center",
    paddingBottom: 28,
  },
  logoBox: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  logoImage: {
    width: 58,
    height: 58,
  },
  title: {
    marginTop: 18,
    fontSize: 26,
    lineHeight: 48,
    fontWeight: "700",
    color: "#161B2E",
    textAlign: "center",
    fontFamily: "Outfit",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#667085",
    marginBottom: 24,
  },
  formCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B7BDCB",
    backgroundColor: "#F7F8FB",
    padding: 20,
  },
  label: {
    color: "#283046",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CDD3E1",
    backgroundColor: "#F4F6FA",
    paddingHorizontal: 12,
    color: "#2B3145",
    fontSize: 15,
  },
  fieldTopSpace: {
    marginTop: 16,
  },
  rememberRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: "#9AA3B2",
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  rememberText: {
    color: "#4C556B",
    fontSize: 14,
    fontWeight: "500",
  },
  forgotText: {
    color: "#5C43A8",
    fontSize: 14,
    fontWeight: "600",
  },
  signInButton: {
    marginTop: 18,
    width: "100%",
    height: 46,
    borderRadius: 8,
    backgroundColor: "#5C43A8",
    justifyContent: "center",
    alignItems: "center",
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  dividerRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#D2D8E3",
  },
  dividerText: {
    color: "#7A8294",
    fontSize: 15,
  },
  googleButton: {
    marginTop: 18,
    width: "100%",
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CDD3E1",
    backgroundColor: "#F9FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  googleIcon: {
    color: "#2F3548",
    fontSize: 32,
    lineHeight: 32,
  },
  googleText: {
    color: "#2F3548",
    fontSize: 18,
    fontWeight: "500",
  },
  switchAuth: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  switchAuthText: {
    color: "#667085",
    fontSize: 14,
  },
  switchAuthLink: {
    color: "#5C43A8",
    fontSize: 14,
    fontWeight: "600",
  },
});
