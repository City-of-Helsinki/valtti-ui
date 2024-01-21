const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// FIXME: Temporary fix to get rid of annoying console.warn's
// App needs refactoring to get rid of require-cycles
config.resolver.requireCycleIgnorePatterns = [/(^|\/|\\)src($|\/|\\)/];

// Metro Bundler Configuration
module.exports = config;
