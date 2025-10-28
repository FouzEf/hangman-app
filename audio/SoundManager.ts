import { Audio } from "expo-av";

export type SoundKey =
  | "failLevel"
  | "selectButton"
  | "singleTap"
  | "winLevel"
  | "winPage"
  | "wind"
  | "rope";

const soundFiles: Record<SoundKey, number> = {
  failLevel: require("../assets/sounds/failLevel.mp3"),
  selectButton: require("../assets/sounds/selectButton.mp3"),
  singleTap: require("../assets/sounds/singleTap.wav"),
  winLevel: require("../assets/sounds/winLevel.mp3"),
  winPage: require("../assets/sounds/winPage.mp3"),
  wind: require("../assets/sounds/wind.mp3"),
  rope: require("../assets/sounds/rope.mp3"),
};

class SoundManager {
  private static _instance: SoundManager;
  private cache = new Map<SoundKey, Audio.Sound>();
  private _muted = false;

  static get instance() {
    if (!this._instance) this._instance = new SoundManager();
    return this._instance;
  }

  async setMuted(muted: boolean) {
    this._muted = muted;
    if (muted) {
      await this.stopAll();
      await this.setVolumeForAll(0);
    } else {
      await this.setVolumeForAll(1);
    }
  }

  async preloadAll() {
    await Promise.all(
      (Object.keys(soundFiles) as SoundKey[]).map(async (key) => {
        if (!this.cache.has(key)) {
          const { sound } = await Audio.Sound.createAsync(soundFiles[key], {
            volume: this._muted ? 0 : 1,
            shouldPlay: false,
            isLooping: false,
          });
          this.cache.set(key, sound);
        }
      })
    );
  }

  // ---- helpers -------------------------------------------------------------

  private async getOrCreate(key: SoundKey) {
    let snd = this.cache.get(key);
    if (!snd) {
      const { sound } = await Audio.Sound.createAsync(soundFiles[key], {
        volume: this._muted ? 0 : 1,
        shouldPlay: false,
        isLooping: false,
      });
      snd = sound;
      this.cache.set(key, snd);
    }
    return snd;
  }

  // ---- playback ------------------------------------------------------------

  /** One-shot play (loops disabled each time). No-op if muted. */
  async play(key: SoundKey) {
    if (this._muted) return;
    const snd = await this.getOrCreate(key);
    try {
      await snd.setIsLoopingAsync(false);
      await snd.setPositionAsync(0);
      await snd.playAsync();
    } catch {
      // ignore race errors
    }
  }

  /** Looping play for background tracks (e.g., "winPage"). No-op if muted. */
  async playLooping(key: SoundKey) {
    if (this._muted) return;
    const snd = await this.getOrCreate(key);
    try {
      await snd.setIsLoopingAsync(true);
      await snd.setPositionAsync(0);
      await snd.playAsync();
    } catch {
      // ignore race errors
    }
  }

  /** Stop a specific sound if loaded. */
  async stop(key: SoundKey) {
    const snd = this.cache.get(key);
    if (!snd) return;
    try {
      await snd.stopAsync();
    } catch {
      // ignore if not playing
    }
  }

  async stopAll() {
    await Promise.all(
      [...this.cache.values()].map(async (s) => {
        try {
          await s.stopAsync();
        } catch {}
      })
    );
  }

  async setVolumeForAll(volume: number) {
    await Promise.all(
      [...this.cache.values()].map((s) => s.setVolumeAsync(volume))
    );
  }

  async unloadAll() {
    await Promise.all([...this.cache.values()].map((s) => s.unloadAsync()));
    this.cache.clear();
  }
}

export const soundManager = SoundManager.instance;
