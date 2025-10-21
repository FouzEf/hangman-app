import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { clickSound } from "../assets/sounds/selectButton.mp3"; // imported here, once

export default function SoundButton() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(clickSound);
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return playSound;
}
