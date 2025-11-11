// jest/setup.js

// Import React Native-specific matchers
import "@testing-library/jest-native/extend-expect";

// CRITICAL FIX: Set global EXPO_OS to suppress console warnings from Expo packages.
// @ts-ignore
global.process.env.EXPO_OS = "ios";

/* =========================
 * Core React Native mocks
 * ========================= */
// Prevent React Native trying to use native animations during tests

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

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

/* =========================
 * Animated / Reanimated blockers (CRITICAL)
 * ========================= */

// Prevent RN dev renderer from calling native animated paths
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock Reanimated v2+ with official test mock
jest.mock("react-native-reanimated", () => {
  const mock = require("react-native-reanimated/mock");
  // Some versions expect this global to exist
  global.__reanimatedWorkletInit = () => {};
  // No-op .call to avoid crashes from layout animations in tests
  mock.default.call = () => {};
  return mock;
});

// Animated(Image) / Image asset lookups needed by Animated refs
jest.mock("react-native/Libraries/Image/AssetRegistry", () => ({
  getAssetByID: () => ({
    httpServerLocation: "",
    width: 0,
    height: 0,
    scales: [1],
    hash: "",
    name: "",
    type: "png",
  }),
}));

// Optional: no-op LayoutAnimation to avoid native path
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { LayoutAnimation } = require("react-native");
  if (LayoutAnimation && LayoutAnimation.configureNext) {
    LayoutAnimation.configureNext = () => {};
  }
} catch {
  // ignore in CI
}

/* =========================
 * UI / Expo module mocks
 * ========================= */

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

/* =========================
 * Storage / platform services
 * ========================= */

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
      setOnPlaybackStatusUpdate: jest.fn(),
      setVolumeAsync: jest.fn().mockResolvedValue(undefined),
      setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
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

/* =========================
 * Test hygiene
 * ========================= */

afterEach(() => {
  // Clean up any pending timers/intervals from components (avoids worker force-exit)
  jest.runOnlyPendingTimers?.();
  jest.clearAllTimers?.();
  jest.clearAllMocks();
  jest.useRealTimers();
});

// --- Bypass Animated wrapping (prevents ref/setNativeView crashes) ---
jest.mock("react-native/Libraries/Animated/createAnimatedComponent", () => {
  return (Component) => Component; // passthrough — removes native animated wrapper
});

// --- Make TouchableOpacity a plain View (no Pressability internals) ---
jest.mock(
  "react-native/Libraries/Components/Touchable/TouchableOpacity",
  () => {
    const React = require("react");
    const { View } = require("react-native");
    const Mock = React.forwardRef((props, ref) =>
      React.createElement(View, { ref, ...props }, props.children)
    );
    Mock.displayName = "TouchableOpacity";
    return Mock;
  }
);

// --- Patch root 'react-native' exports to be test-safe ---
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  const React = require("react");

  // Make TouchableOpacity a plain View to avoid Pressability/refs internals
  const TouchableOpacity = React.forwardRef((props, ref) =>
    React.createElement(RN.View, { ref, ...props }, props.children)
  );
  TouchableOpacity.displayName = "TouchableOpacity";

  // Force Animated to be "passthrough" — Animated(Image/View) -> plain component
  const Animated = {
    ...RN.Animated,
    // identity wrapper prevents setNativeView/ref wiring that crashes in tests
    createAnimatedComponent: (Component) => Component,
  };

  // No-op LayoutAnimation to stay on JS path
  const LayoutAnimation = {
    ...RN.LayoutAnimation,
    configureNext: () => {},
  };

  return {
    ...RN,
    TouchableOpacity,
    Animated,
    LayoutAnimation,
  };
});

// keep your timer cleanup
afterEach(() => {
  jest.runOnlyPendingTimers?.();
  jest.clearAllTimers?.();
  jest.clearAllMocks();
  jest.useRealTimers();
});
