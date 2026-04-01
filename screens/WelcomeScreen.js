import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Purple arc decoration at top */}
      <View style={styles.arcTop} />
      <View style={styles.arcTopInner} />

      <View style={styles.content}>
        {/* Logo */}
          <View style={styles.logoBox}>
          <Image
            source={require("../Logo.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="cover"
          />
        </View>

        {/* Brand */}
        <Text style={styles.appName}>ClearPay</Text>
        <Text style={styles.tagline}>
          All your subscriptions,{"\n"}in one clear place.
        </Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate("Register")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>Create an Account</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By continuing you agree to our{" "}
          <Text style={styles.legalLink}>Terms</Text> and{" "}
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Decorative arcs
  arcTop: {
    position: "absolute",
    top: -width * 0.55,
    left: -width * 0.2,
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: "#5B3FD9",
    opacity: 0.07,
  },
  arcTopInner: {
    position: "absolute",
    top: -width * 0.72,
    left: -width * 0.1,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: "#5B3FD9",
    opacity: 0.06,
  },

  // Center content
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    marginBottom: 28,
    shadowColor: "#5B3FD9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },

  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#1a1a2e",
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  tagline: {
    fontSize: 17,
    color: "#888",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
  },

  // Bottom buttons
  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  btnPrimary: {
    backgroundColor: "#5B3FD9",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#5B3FD9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDD6F7",
    backgroundColor: "#F7F5FF",
    marginBottom: 20,
  },
  btnSecondaryText: {
    color: "#5B3FD9",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  legal: {
    textAlign: "center",
    fontSize: 12,
    color: "#bbb",
    lineHeight: 18,
  },
  legalLink: {
    color: "#9B8EC4",
    fontWeight: "500",
  },
});
