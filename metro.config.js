/**
 * Metro configuration for React Native
 * https://reactnative.dev/docs/metro
 *
 * @format
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

const config = {}
module.exports = mergeConfig(getDefaultConfig(__dirname), config)
