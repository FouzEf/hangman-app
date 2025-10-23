import { Audio, AVPlaybackSource } from "expo-av";
import { useEffect, useRef } from "react";

type Loaded = Record<string, Audio.Sound>;

export function useSound(map: Record<string, AVPlaybackSource>) {
  const ref = useRef<Loaded>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      for (const [k, src] of Object.entries(map)) {
        const { sound } = await Audio.Sound.createAsync(src);
        if (mounted) ref.current[k] = sound;
      }
    })();
    return () => {
      mounted = false;
      const arr = Object.values(ref.current);
      ref.current = {};
      arr.forEach((s) => s.unloadAsync());
    };
  }, []);

  const play = async (key: string, volume = 1) => {
    const s = ref.current[key];
    if (!s) return;
    try {
      await s.setIsLoopingAsync(false);
      await s.setVolumeAsync(volume);
      await s.stopAsync().catch(() => {});
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch {}
  };

  return { play };
}
