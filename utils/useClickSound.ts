// hooks/useClickSound.ts
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef } from "react";
import selectSound from "../assets/sounds/selectButton.mp3";

export default function useClickSound(enabled = true) {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    (async () => {
      const { sound } = await Audio.Sound.createAsync(selectSound);
      if (mounted) soundRef.current = sound;
    })();
    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [enabled]);

  const play = useCallback(async () => {
    const s = soundRef.current;
    if (!s) return; // not ready yet
    await s.replayAsync(); // fast “click” behavior
  }, []);

  return play;
}
