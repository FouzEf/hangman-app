// jest.config.js
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  transformIgnorePatterns: [
    // Corrected/Improved transformIgnorePatterns
    // It whitelists all packages that need transformation (like 'expo' and related libs)
    "node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|react-native-gesture-handler|react-native-reanimated|expo-modules-core|expo-router|@react-navigation|@sentry|@unimodules)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFiles: ["<rootDir>/jest/setup.pre.js"], // runs BEFORE env, for RN shims
  setupFilesAfterEnv: ["<rootDir>/jest/setup.after.js"], // testing-library, matchers, etc.
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"],
};
