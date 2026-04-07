const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Bundle Whisper .bin model files as assets so they ship inside the APK
config.resolver.assetExts.push('bin');

module.exports = withNativeWind(config, { input: './global.css' });
