// rn-cli.config.js

// eslint-disable-next-line no-undef
module.exports = {
  getTransformModulePath() {
    return require.resolve("react-native-typescript-transformer");
  },

  getSourceExts() {
    return ["ts", "tsx"];
  },
};
