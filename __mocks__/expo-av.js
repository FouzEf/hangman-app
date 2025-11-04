/**
 * @fileoverview Mock file for 'expo-av' for Jest testing environment.
 * This mock ensures that any component or module importing { Audio } from 'expo-av'
 * can run without dependency on the native module, which is unavailable in the Node environment.
 *
 * It provides a basic structure for Audio.Sound to prevent runtime errors.
 */

// Mock the Audio export with a simple structure
export const Audio = {
  // Mock the Sound class used in SoundManager.ts
  Sound: class {
    constructor() {
      // Mock the internal instance to hold mock functions
      this.status = {};
    }

    // Mock lifecycle methods to return resolved promises
    async loadAsync() {
      return { isLoaded: true };
    }
    async unloadAsync() {}
    async playAsync() {}
    async stopAsync() {}
    async setIsLoopingAsync(isLooping) {
      this.status.isLooping = isLooping;
    }
    async setPositionAsync(positionMillis) {
      this.status.positionMillis = positionMillis;
    }
    async setVolumeAsync(volume) {
      this.status.volume = volume;
    }

    // Mock static method on the class (used for initial creation)
    static createAsync() {
      // Return a tuple of a mock sound instance and its initial status
      return [new this(), { isLoaded: true, isPlaying: false }];
    }
  },

  // Mock static method to set Audio mode, if used
  setAudioModeAsync: async () => {},
};
