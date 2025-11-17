import { useCallback } from "react";
import { soundManager } from "./SoundManager";

// Plays the global "selectButton" sound via SoundManager.
// Respects global mute automatically.
export default function useClickSound() {
  return useCallback(() => {
    soundManager.play("selectButton");
  }, []);
}
