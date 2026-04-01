import React from "react";
import { Image, View } from "react-native";

const logoSource = require("../../Logo.png");

export default function ClearPayLogo({ size = 34, radius = 9 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={logoSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}
