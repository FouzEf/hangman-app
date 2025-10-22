import { Audio, AVPlaybackStatusSuccess } from "expo-av";

export type SoundKey =
  | "failLevel"
  | "selectButton"
  | "singleTap"
  | "winLevel"
  | "winPage";

const soundFiles: Record<SoundKey, number> = {
  failLevel: require("../assets/sounds/failLevel.mp3"),
  selectButton: require("../assets/sounds/selectButton.mp3"),
  singleTap: require("../assets/sounds/singleTap.wav"),
  winLevel: require("../assets/sounds/winLevel.mp3"),
  winPage: require("../assets/sounds/winPage.mp3"),
};

class SoundManager {
  private static _instance: SoundManager;
  private cache = new Map<SoundKey, Audio.Sound>();
  private _muted = false;

  static get instance() {
    if (!this._instance) this._instance = new SoundManager();
    return this._instance;
  }

  /** Public: set mute and immediately apply to all loaded sounds */
  async setMuted(muted: boolean) {
    this._muted = muted;
    if (muted) {
      // hard stop anything currently playing so the app goes silent now
      await this.stopAll();
      await this.setVolumeForAll(0);
    } else {
      await this.setVolumeForAll(1);
    }
  }

  /** Preload all known sounds (respects current mute volume) */
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

  /** Play by key. No-op if muted. */
  async play(key: SoundKey) {
    if (this._muted) return;
    let snd = this.cache.get(key);
    if (!snd) {
      const created = await Audio.Sound.createAsync(soundFiles[key], {
        volume: this._muted ? 0 : 1,
      });
      snd = created.sound;
      this.cache.set(key, snd);
    }
    try {
      await snd.setPositionAsync(0);
      const status = (await snd.playAsync()) as AVPlaybackStatusSuccess;
      return status;
    } catch {
      // ignore play race errors
    }
  }

  async stopAll() {
    await Promise.all(
      [...this.cache.values()].map(async (s) => {
        try {
          await s.stopAsync();
        } catch {
          // ignore if not playing
        }
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
