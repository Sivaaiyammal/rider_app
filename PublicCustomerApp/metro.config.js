/* global module require __dirname */
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { resolver: { sourceExts, assetExts } } = defaultConfig;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 *  @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
    blockList: [
      // Exclude android build intermediates from being watched
      /node_modules\/.*\/android\/build\/.*/,
      /android\/build\/.*/,
    ],
  },
  watchFolders: [],
};

module.exports = mergeConfig(defaultConfig, config);