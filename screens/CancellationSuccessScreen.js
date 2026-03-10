import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CancellationSuccessScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.message}>
          You have successfully canceled your subscription!
        </Text>
      </View>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Main")}
      >
        <Text style={styles.btnText}>OK</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  card: {
    backgroundColor: "#D1FAE5",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    marginBottom: 28,
    width: "100%",
  },
  message: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#1a1a1a",
    lineHeight: 28,
  },
  btn: {
    backgroundColor: "#5B3FD9",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 60,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
