import Mute from "@assets/images/volume-mute.png";
import UnMute from "@assets/images/volume-up.png";
import React from "react";
import { Image, Pressable, View } from "react-native";
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
        // backgroundColor: muted ? "#ddd" : "#222",
      }}
    >
      <View>
        {muted ? (
          <Image source={Mute} style={{ width: 25, height: 25 }} />
        ) : (
          <Image source={UnMute} style={{ width: 25, height: 25 }} />
        )}
      </View>
    </Pressable>
  );
}
