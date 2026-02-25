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

export default function OnboardingThreeScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={styles.progressBar} />
          <View style={styles.progressBar} />
        </View>

        <View style={styles.logoBox}>
          <Image
            source={require("@/assets/images/ClearPay_logo.png")}
            style={styles.logoImage}
            contentFit="contain"
          />
        </View>

        <Text style={styles.title}>Create your ClearPay account</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            defaultValue="Toms irgeijs"
            placeholder="Enter your name"
            placeholderTextColor="#A3AABD"
          />

          <Text style={[styles.label, styles.fieldTopSpace]}>
            Email address
          </Text>
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
            placeholder="Create password"
            placeholderTextColor="#A3AABD"
            secureTextEntry
          />

          <Text style={[styles.label, styles.fieldTopSpace]}>
            Confirm Password
          </Text>
          <TextInput
            style={styles.input}
            defaultValue="••••••••"
            placeholder="Confirm password"
            placeholderTextColor="#A3AABD"
            secureTextEntry
          />

          <Pressable
            style={styles.nextButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.nextButtonText}>
              Next: Link Your Bank Accounts
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.loginPrompt}
          onPress={() => router.replace("./onboarding-two")}
        >
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text style={styles.loginLink}>Login</Text>
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
  },
  headerText: {
    color: "#666A76",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  container: {
    alignItems: "center",
    paddingBottom: 32,
    marginHorizontal: 14,
  },
  progressRow: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#DCCEFF",
  },
  progressActive: {
    backgroundColor: "#5C43A8",
  },
  logoBox: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  logoImage: {
    width: 58,
    height: 58,
  },
  title: {
    marginTop: 18,
    marginBottom: 28,
    fontSize: 26,
    lineHeight: 48,
    fontWeight: "700",
    color: "#161B2E",
    fontFamily: "Outfit",
    marginVertical: 14,
  },
  formCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B7BDCB",
    backgroundColor: "#F7F8FB",
    padding: 20,
    marginHorizontal: 14,
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
  nextButton: {
    marginTop: 20,
    width: "100%",
    height: 46,
    borderRadius: 8,
    backgroundColor: "#5C43A8",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginPrompt: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    color: "#667085",
    fontSize: 14,
  },
  loginLink: {
    color: "#5C43A8",
    fontSize: 14,
    fontWeight: "600",
  },
});
