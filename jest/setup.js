// jest/setup.js

// Import React Native-specific matchers
import "@testing-library/jest-native/extend-expect";

// CRITICAL FIX: Set global EXPO_OS to suppress console warnings from Expo packages.
// @ts-ignore
global.process.env.EXPO_OS = "ios";

// 1. FIX: Mock TurboModuleRegistry (for newer React Native versions)
jest.mock("react-native/Libraries/TurboModule/TurboModuleRegistry", () => ({
  // General fallback for feature flag checks
  get: () => null,
  // Mock 'getEnforcing' for modules like DevMenu
  getEnforcing: (name) => {
    if (name === "DevMenu") {
      return {};
    }
    return () => ({});
  },
}));

// 2. FIX: Mock NativeDeviceInfo for Dimensions/StyleSheet
jest.mock("react-native/Libraries/Utilities/NativeDeviceInfo", () => ({
  getConstants: () => ({
    // Provide static dimensions required for initialization
    Dimensions: {
      window: { width: 375, height: 667, scale: 2, fontScale: 1 },
      screen: { width: 375, height: 667, scale: 2, fontScale: 1 },
    },
  }),
}));

// 3. CRITICAL FIX: Mock Native Modules for Keyboard/NativeEventEmitter
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

// 4. CRITICAL FIX: Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: React.forwardRef((props, ref) =>
      React.createElement(View, { ref, ...props }, props.children)
    ),
  };
});

// 5. NEW CRITICAL FIX: Mock @expo/vector-icons (e.g., Ionicons)
// Prevents: "Element type is invalid..." for Icon components
// Mocking the whole package ensures all icon sets are covered.
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  AntDesign: "AntDesign",
  MaterialCommunityIcons: "MaterialCommunityIcons",
  // Add other icon sets used in your project as needed
}));

// 6. NEW CRITICAL FIX: Mock react-native-toast-message
jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
  hide: jest.fn(),
  Toast: "Toast", // Mock component for the root render
}));

// Mock AsyncStorage
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

// Mock Firebase
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({ options: { projectId: "test-project-id" } })),
}));

// Mock Expo Audio (expo-av)
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
    })),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock other common Expo modules
jest.mock("expo-constants", () => ({
  default: { manifest: { extra: {} } },
}));

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
}));
