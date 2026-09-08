import { ExpoConfig, ConfigContext } from 'expo/config';
import pkg from './package.json';
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "PubTrail",
  slug: "pubtrail",
  owner: "pavlos_spn",
  version: pkg.version,
  orientation: "default",
  scheme: "pubtrail",
  userInterfaceStyle: "automatic",
  icon: "./assets/images/adaptive-foreground.png",
  androidStatusBar: {
    barStyle: "dark-content",
    backgroundColor: "#f6f1e8"
  },
  android: {
    // Seed value only - eas.json sets appVersionSource: "remote", so EAS Build
    // owns the real versionCode and auto-increments it per build.
    versionCode: 1,
    googleServicesFile: "./pubtrail-firebase-android.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-foreground.png",
      backgroundColor: "#ffffff",
    },
    package: "com.pubtrail.app",
  },
  web: {
    bundler: "metro",
    output: "static"
  },
  extra: {
    eas: {
      projectId: "910d50b4-331b-47e0-92d8-74560ad8f44c"
    }
  },
  plugins: [
      "expo-router",
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Show current location on map.",
          "isAndroidForegroundServiceEnabled": true
        }
      ],
    [
      "@rnmapbox/maps"
    ],
    [
      "expo-camera",
      {
        "cameraPermission": "Allow PubTrail to use your camera to capture pub crawl photos.",
        "recordAudioAndroid": false
      }
    ],
    [
      "expo-media-library",
      {
        "photosPermission": "Allow PubTrail to save crawl photos to your library.",
        "savePhotosPermission": "Allow PubTrail to save crawl photos to your library.",
        "isAccessMediaLocationEnabled": false
      }
    ],
    "@react-native-community/datetimepicker",
    "@react-native-async-storage/expo-with-async-storage"
  ],
  ios: {
    bundleIdentifier: "com.pubtrail.app",
    googleServicesFile: "./pubtrail-firebase-ios.plist"
  }
});
