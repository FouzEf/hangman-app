import "@testing-library/jest-native/extend-expect";

// jest/setup.js

// Extend Jest with React Native–specific matchers
import "@testing-library/jest-native/extend-expect";

// Silence Expo’s missing env warning in tests
process.env.EXPO_OS = process.env.EXPO_OS || "android";

// Mock native modules that rely on native views or context
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: React.forwardRef((props, ref) => (
      <View ref={ref} {...props} />
    )),
  };
});

// (Optional) Add more mocks if you test screens that import these
jest.mock("expo-constants", () => ({
  default: { manifest: { extra: {} } },
}));

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
}));
