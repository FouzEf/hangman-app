// jest/setup.pre.js
// Runs BEFORE the test framework so we can override RN internals early.

// Keep Expo OS stable
process.env.EXPO_OS = process.env.EXPO_OS || "ios";

// 1) Kill Native Animated bridge usage
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// 2) Make createAnimatedComponent a passthrough
jest.mock("react-native/Libraries/Animated/createAnimatedComponent", () => {
  return (Component) => Component;
});

// 3) Make asset lookups safe for Animated(Image)
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

// 4) Reanimated v2 mock
jest.mock("react-native-reanimated", () => {
  const mock = require("react-native-reanimated/mock");
  global.__reanimatedWorkletInit = () => {};
  mock.default.call = () => {};
  return mock;
});

// 5) Patch the root 'react-native' export early
jest.mock("react-native", () => {
  // Important: require the real module first
  const RN = jest.requireActual("react-native");
  const React = require("react");

  // TouchableOpacity -> plain View to avoid Pressability/native internals
  const TouchableOpacity = React.forwardRef((props, ref) =>
    React.createElement(RN.View, { ref, ...props }, props.children)
  );
  TouchableOpacity.displayName = "TouchableOpacity";

  // Animated passthrough: no wrappers
  const Animated = {
    ...RN.Animated,
    createAnimatedComponent: (Component) => Component,
  };

  // No-op layout animations (stay on JS path)
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
