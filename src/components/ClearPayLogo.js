import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PURPLE = "#5B3FD9";

export default function ClearPayLogo({ size = 34, radius = 9, inverted = false }) {
  const bgColor = inverted ? "#fff" : PURPLE;
  const iconColor = inverted ? PURPLE : "#fff";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: bgColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="card" size={Math.round(size * 0.52)} color={iconColor} />
    </View>
  );
}
