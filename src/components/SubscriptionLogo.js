import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { getSubscriptionBrand, normalizeLogoDomain } from "../lib/subscriptionLogos";

export default function SubscriptionLogo({ name, color, logoDomain, size = 44, radius = 12 }) {
  const brand = getSubscriptionBrand(name);
  const [iconHorseFailed, setIconHorseFailed] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  const resolvedLogoDomain = normalizeLogoDomain(logoDomain) || normalizeLogoDomain(brand?.domain || "");

  const bgColor = brand?.color || color || "#9B8EC4";
  const initial = (name || "?").charAt(0).toUpperCase();
  const imgSize = Math.round(size * 0.72);
  const fontSize = Math.round(size * 0.38);

  useEffect(() => {
    setIconHorseFailed(false);
    setGoogleFailed(false);
  }, [resolvedLogoDomain]);

  if (resolvedLogoDomain) {
    if (!iconHorseFailed) {
      return (
        <View style={{
          width: size, height: size, borderRadius: radius,
          backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF",
          justifyContent: "center", alignItems: "center", overflow: "hidden",
        }}>
          <Image
            source={{ uri: `https://icon.horse/icon/${resolvedLogoDomain}` }}
            style={{ width: imgSize, height: imgSize }}
            resizeMode="contain"
            onError={() => setIconHorseFailed(true)}
          />
        </View>
      );
    }

    if (!googleFailed) {
      return (
        <View style={{
          width: size, height: size, borderRadius: radius,
          backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF",
          justifyContent: "center", alignItems: "center", overflow: "hidden",
        }}>
          <Image
            source={{ uri: `https://www.google.com/s2/favicons?domain=${resolvedLogoDomain}&sz=128` }}
            style={{ width: imgSize, height: imgSize }}
            resizeMode="contain"
            onError={() => setGoogleFailed(true)}
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
