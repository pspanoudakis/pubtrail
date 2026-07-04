import { ExpoConfig, ConfigContext } from 'expo/config';
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "PubTrail",
  slug: "pubtrail",
  version: "1.0.0",
  orientation: "default",
  scheme: "pubtrail",
  userInterfaceStyle: "automatic",
  icon: "./assets/images/adaptive-foreground.png",
  androidStatusBar: {
    barStyle: "dark-content",
    backgroundColor: "#f6f1e8"
  },
  android: {
    versionCode: 1,
    googleServicesFile: "./pubtrail-firebase-android.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-foreground.png",
      backgroundColor: "#ffffff",
    },
    package: "com.anonymous.pubtrail",
  },
  web: {
    bundler: "metro",
    output: "static"
  },
  extra: {
    eas: {
      projectId: "12852f88-6bdb-4fca-872e-2448ba2ae1a2"
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
    bundleIdentifier: "com.anonymous.pubtrail",
    googleServicesFile: "./pubtrail-firebase-ios.plist"
  }
});
