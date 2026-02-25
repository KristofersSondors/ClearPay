import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heroText}>Welcome to{"\n"}ClearPay!</Text>
        </View>

        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push("./onboarding-two")}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push("./onboarding-three")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </Pressable>
      </View>
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
    flex: 1,
    justifyContent: "center",
  },
  heroCard: {
    width: "100%",
    height: 300,
    backgroundColor: "#9A8EAE",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 108,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
  },
  heroText: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700",
    color: "#1D1B20",
    textAlign: "center",
    fontFamily: "Outfit",
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  primaryButton: {
    backgroundColor: "#5C43A8",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit",
  },
});
