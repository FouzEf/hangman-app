// jest/setup.js

// Import React Native-specific matchers
import "@testing-library/jest-native/extend-expect";

// Keep Expo OS stable in tests
// @ts-ignore
global.process.env.EXPO_OS = "ios";

/* =========================
 * Core React Native/TurboModule shims
 * (do NOT re-mock react-native itself here)
 * ========================= */

// TurboModuleRegistry (for newer RN versions)
jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => ({
  get: () => null,
  getEnforcing: (name) => {
    if (name === "DevMenu") return {};
    return () => ({});
  },
}));

// NativeDeviceInfo for Dimensions/StyleSheet
jest.mock("react-native/Libraries/Utilities/NativeDeviceInfo", () => ({
  getConstants: () => ({
    Dimensions: {
      window: { width: 375, height: 667, scale: 2, fontScale: 1 },
      screen: { width: 375, height: 667, scale: 2, fontScale: 1 },
    },
  }),
}));

// Minimal NativeModules used by RN internals
jest.mock("react-native/Libraries/BatchedBridge/NativeModules", () => ({
  KeyboardObserver: {
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
  PlatformConstants: {
    forceTouchAvailable: false,
    interfaceIdiom: "handset",
  },
  UIManager: {
    getViewManagerConfig: jest.fn(),
  },
  NativeDeviceInfo: {
    getConstants: () => ({
      Dimensions: {
        window: { width: 375, height: 667, scale: 2, fontScale: 1 },
        screen: { width: 375, height: 667, scale: 2, fontScale: 1 },
      },
    }),
  },
}));

/* =========================
 * UI / Expo module mocks
 * ========================= */

// expo-linear-gradient
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: React.forwardRef((props, ref) =>
      React.createElement(View, { ref, ...props }, props.children)
    ),
  };
});

// @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  AntDesign: "AntDesign",
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// react-native-toast-message
jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
  hide: jest.fn(),
  Toast: "Toast",
}));

// AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  flushGetRequests: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));

// Firebase (app only; expand if needed)
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({ options: { projectId: "test-project-id" } })),
}));

// Expo Audio (expo-av)
jest.mock("expo-av", () => ({
  Audio: {
    Sound: jest.fn(() => ({
      loadAsync: jest.fn().mockResolvedValue({ sound: {} }),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      playAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest.fn().mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
        didJustFinish: false,
      }),
      setOnPlaybackStatusUpdate: jest.fn(),
      setVolumeAsync: jest.fn().mockResolvedValue(undefined),
      setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
    })),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

// Other common Expo modules
jest.mock("expo-constants", () => ({
  default: { manifest: { extra: {} } },
}));

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
}));

/* =========================
 * Test hygiene
 * ========================= */

// jest/setup.js
afterEach(() => {
  // Do NOT advance timers globally. Individual tests that use fake timers should manage them.
  jest.clearAllTimers();
  jest.clearAllMocks();
  jest.useRealTimers();
});
