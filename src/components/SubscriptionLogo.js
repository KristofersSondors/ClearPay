import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { getSubscriptionBrand } from "../lib/subscriptionLogos";

export default function SubscriptionLogo({ name, color, size = 44, radius = 12 }) {
  const brand = getSubscriptionBrand(name);
  const [clearbitFailed, setClearbitFailed] = useState(false);
  const [iconHorseFailed, setIconHorseFailed] = useState(false);

  const bgColor = brand?.color || color || "#9B8EC4";
  const initial = (name || "?").charAt(0).toUpperCase();
  const imgSize = Math.round(size * 0.72);
  const fontSize = Math.round(size * 0.38);

  if (brand) {
    // Try Clearbit first (high quality), then icon.horse, then fallback to initial
    if (!clearbitFailed) {
      return (
        <View style={{
          width: size, height: size, borderRadius: radius,
          backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF",
          justifyContent: "center", alignItems: "center", overflow: "hidden",
        }}>
          <Image
            source={{ uri: `https://logo.clearbit.com/${brand.domain}` }}
            style={{ width: imgSize, height: imgSize }}
            resizeMode="contain"
            onError={() => setClearbitFailed(true)}
          />
        </View>
      );
    }

    if (!iconHorseFailed) {
      return (
        <View style={{
          width: size, height: size, borderRadius: radius,
          backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF",
          justifyContent: "center", alignItems: "center", overflow: "hidden",
        }}>
          <Image
            source={{ uri: `https://icon.horse/icon/${brand.domain}` }}
            style={{ width: imgSize, height: imgSize }}
            resizeMode="contain"
            onError={() => setIconHorseFailed(true)}
          />
        </View>
      );
    }
  }

  return (
    <View style={{
      width: size, height: size, borderRadius: radius,
      backgroundColor: bgColor,
      justifyContent: "center", alignItems: "center", overflow: "hidden",
    }}>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize }}>{initial}</Text>
    </View>
  );
}
