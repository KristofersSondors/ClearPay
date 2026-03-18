import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CURRENCY_OPTIONS,
  getPreferredCurrency,
  setPreferredCurrency,
} from "../src/lib/currencyPreferences";

export default function CurrencyScreen({ navigation }) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  useEffect(() => {
    const loadPreferredCurrency = async () => {
      const preferred = await getPreferredCurrency();
      setSelectedCurrency(preferred);
    };

    loadPreferredCurrency();
  }, []);

  const handleSelect = async (currencyCode) => {
    setSelectedCurrency(currencyCode);
    await setPreferredCurrency(currencyCode);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Currency & Region</Text>
        <Text style={styles.pageSubTitle}>
          Choose your preferred currency for new subscriptions.
        </Text>

        <View style={styles.card}>
          {CURRENCY_OPTIONS.map((option) => {
            const isSelected = selectedCurrency === option.code;

            return (
              <TouchableOpacity
                key={option.code}
                style={styles.currencyRow}
                onPress={() => handleSelect(option.code)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.currencyCode}>{option.code}</Text>
                  <Text style={styles.currencyLabel}>{option.label}</Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    isSelected ? styles.radioOuterActive : null,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F7" },
  container: { flex: 1, backgroundColor: "#F5F5F7", padding: 16 },
  backButton: { alignSelf: "flex-start", marginBottom: 8 },
  backButtonText: { color: "#5B3FD9", fontSize: 14, fontWeight: "500" },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  pageSubTitle: { fontSize: 13, color: "#666", marginBottom: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  currencyCode: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  currencyLabel: { fontSize: 13, color: "#777", marginTop: 2 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D4D4D4",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: "#5B3FD9",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#5B3FD9",
  },
});
