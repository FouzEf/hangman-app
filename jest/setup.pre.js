// jest/setup.pre.js
process.env.EXPO_OS = process.env.EXPO_OS || "ios";

// 1) NativePlatformConstantsIOS – provide default.getConstants(), cover both resolver paths
const makeNPCI = () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      forceTouchAvailable: false,
      interfaceIdiom: "phone",
      osVersion: "14.0",
      systemName: "iOS",
    }),
  },
});
jest.mock(
  "react-native/Libraries/Utilities/NativePlatformConstantsIOS",
  () => makeNPCI(),
  { virtual: true }
);
jest.mock(
  "react-native/Libraries/Utilities/NativePlatformConstantsIOS.ios.js",
  () => makeNPCI(),
  { virtual: true }
);

// 2) Platform.ios – minimal shape Animated/Touchable read, cover both resolver paths
const makePlatformIOS = () => ({
  __esModule: true,
  default: {
    OS: "ios",
    select: (obj) => (obj ? (obj.ios ?? obj.default) : undefined),
    // AnimatedExports touches these:
    constants: {},
    isDisableAnimations: () => true,
  },
});
jest.mock(
  "react-native/Libraries/Utilities/Platform.ios",
  () => makePlatformIOS(),
  { virtual: true }
);
jest.mock(
  "react-native/Libraries/Utilities/Platform.ios.js",
  () => makePlatformIOS(),
  { virtual: true }
);

// 3) Animated internals – quiet native bridge & expose flag
jest.mock(
  "react-native/Libraries/Animated/AnimatedExports",
  () => ({ __esModule: true, isDisableAnimations: () => true }),
  { virtual: true }
);
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper", () => ({}), {
  virtual: true,
});
jest.mock(
  "react-native/Libraries/Animated/createAnimatedComponent",
  () => (Component) => Component,
  { virtual: true }
);

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
