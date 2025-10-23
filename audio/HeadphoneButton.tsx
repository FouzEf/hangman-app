import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSoundSettings } from "./SoundSettingsContext";

export default function HeadphoneButton() {
  const { muted, toggleMuted } = useSoundSettings();
  return (
    <Pressable
      onPress={toggleMuted}
      accessibilityRole="button"
      accessibilityLabel={muted ? "Unmute sounds" : "Mute sounds"}
      style={{
        padding: 10,
        borderRadius: 999,
        backgroundColor: muted ? "#ddd" : "#222",
      }}
    >
      <View>
        <Text style={{ fontSize: 18, color: muted ? "#222" : "#fff" }}>
          {muted ? "🔇" : "🔈"}
        </Text>
      </View>
    </Pressable>
  );
}
