import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#5B3FD9";
const PURPLE_LIGHT = "#7B63E8";
const PURPLE_DARK = "#3D28A8";

/**
 * ClearPay Brand Logo
 *
 * Usage:
 *   <ClearPayBrandLogo size="small" />   — 40px icon only
 *   <ClearPayBrandLogo size="medium" />  — 64px icon + wordmark (default)
 *   <ClearPayBrandLogo size="large" />   — 96px icon + wordmark
 *   <ClearPayBrandLogo iconOnly />       — icon without wordmark
 */
export default function ClearPayBrandLogo({ size = "medium", iconOnly = false }) {
  const config = {
    small:  { iconSize: 40, radius: 12, cardSize: 18, checkSize: 10, dotSize: 6, fontSize: 18, gap: 10 },
    medium: { iconSize: 64, radius: 18, cardSize: 28, checkSize: 14, dotSize: 9,  fontSize: 26, gap: 14 },
    large:  { iconSize: 96, radius: 26, cardSize: 42, checkSize: 20, dotSize: 13, fontSize: 38, gap: 18 },
  };

  const c = config[size] || config.medium;

  return (
    <View style={{ flexDirection: iconOnly ? "column" : "row", alignItems: "center", gap: c.gap }}>
      {/* Icon mark */}
      <View
        style={{
          width: c.iconSize,
          height: c.iconSize,
          borderRadius: c.radius,
          backgroundColor: PURPLE,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: PURPLE_DARK,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        {/* Card icon base */}
        <Ionicons name="card" size={c.cardSize} color="rgba(255,255,255,0.25)" style={{ position: "absolute" }} />

        {/* Checkmark circle — the "Clear" in ClearPay */}
        <View
          style={{
            width: c.iconSize * 0.58,
            height: c.iconSize * 0.58,
            borderRadius: c.iconSize * 0.29,
            borderWidth: c.iconSize * 0.045,
            borderColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="checkmark" size={c.checkSize} color="#fff" />
        </View>

        {/* Small accent dot — bottom right */}
        <View
          style={{
            position: "absolute",
            bottom: c.iconSize * 0.1,
            right: c.iconSize * 0.1,
            width: c.dotSize,
            height: c.dotSize,
            borderRadius: c.dotSize / 2,
            backgroundColor: PURPLE_LIGHT,
            borderWidth: 1.5,
            borderColor: "#fff",
          }}
        />
      </View>

      {/* Wordmark */}
      {!iconOnly && (
        <View>
          <Text
            style={{
              fontSize: c.fontSize,
              fontWeight: "800",
              letterSpacing: -0.5,
              color: PURPLE,
              lineHeight: c.fontSize * 1.1,
            }}
          >
            Clear
            <Text style={{ color: PURPLE_DARK }}>Pay</Text>
          </Text>
          <Text
            style={{
              fontSize: c.fontSize * 0.28,
              fontWeight: "500",
              color: "#888",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginTop: 1,
            }}
          >
            Subscription Tracker
          </Text>
        </View>
      )}
    </View>
  );
}
