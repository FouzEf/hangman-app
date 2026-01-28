module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@assets": "./assets",
            "@components": "./components",
          },
          extensions: [".js", ".jsx", ".ts", ".tsx", ".png", ".mjs"],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
