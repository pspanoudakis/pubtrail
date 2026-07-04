export const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
};
const requiredKeys = ["apiKey", "authDomain", "projectId", "appId", "googleClientId"] as const;
export const firebaseDatabaseId = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID ?? "(default)";
requiredKeys.forEach(function assertRequiredKey(key) {
    if (!firebaseConfig[key]) {
        throw new Error(`Missing Firebase env var for ${key}. Set the EXPO_PUBLIC_FIREBASE_* values in .env.`);
    }
});