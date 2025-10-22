// audio/SoundSettingsContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { soundManager } from "./SoundManager";

type Ctx = {
  muted: boolean;
  toggleMuted: () => void;
  setMuted: (v: boolean) => void;
};

const SoundSettingsContext = createContext<Ctx | null>(null);

export function SoundSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [muted, setMutedState] = useState(false);

  // initial load: restore mute, apply to manager, then preload sounds
  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem("@muted");
      const initial = v === "1";
      setMutedState(initial);
      await soundManager.setMuted(initial);
      await soundManager.preloadAll();
    })();
  }, []);

  // keep manager + storage in sync. setMuted() stops all when true.
  useEffect(() => {
    (async () => {
      await soundManager.setMuted(muted);
      AsyncStorage.setItem("@muted", muted ? "1" : "0");
    })();
  }, [muted]);

  const value = useMemo<Ctx>(
    () => ({
      muted,
      toggleMuted: () => setMutedState((p) => !p),
      setMuted: (v: boolean) => setMutedState(v),
    }),
    [muted]
  );

  return (
    <SoundSettingsContext.Provider value={value}>
      {children}
    </SoundSettingsContext.Provider>
  );
}

export function useSoundSettings() {
  const ctx = useContext(SoundSettingsContext);
  if (!ctx)
    throw new Error(
      "useSoundSettings must be used within SoundSettingsProvider"
    );
  return ctx;
}
