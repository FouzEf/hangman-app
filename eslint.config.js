// eslint.config.js
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    settings: {
      "import/core-modules": ["@env"],
      "import/resolver": {
        alias: {
          map: [["@env", "./node_modules/react-native-dotenv"]],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
]);
