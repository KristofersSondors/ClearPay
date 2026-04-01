import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { getSubscriptionBrand } from "../lib/subscriptionLogos";

export default function SubscriptionLogo({ name, color, size = 44, radius = 12 }) {
  const brand = getSubscriptionBrand(name);
  const [imgFailed, setImgFailed] = useState(false);

  const bgColor = brand?.color || color || "#9B8EC4";
  const initial = (name || "?").charAt(0).toUpperCase();
  const imgSize = Math.round(size * 0.6);
  const fontSize = Math.round(size * 0.38);

  if (brand && !imgFailed) {
    return (
      <View
        style={[
          styles.wrapper,
          { width: size, height: size, borderRadius: radius, backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF" },
        ]}
      >
        <Image
          source={{ uri: `https://icon.horse/icon/${brand.domain}` }}
          style={{ width: imgSize, height: imgSize }}
          resizeMode="contain"
          onError={() => setImgFailed(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: radius, backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  initial: {
    color: "#fff",
    fontWeight: "700",
  },
});
