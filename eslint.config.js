// eslint.config.js
// https://docs.expo.dev/guides/using-eslint/

const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    env: {
      node: true,
      jest: true, // enables describe, it, expect, etc.
    },
  },
]);
