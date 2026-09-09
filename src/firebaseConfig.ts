import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
    initializeAuth,
    //@ts-ignore
    getReactNativePersistence,
    type Auth,
    getAuth,
} from "firebase/auth";
import { firebaseConfig } from "@/firebaseEnv";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

interface FirebaseAppInternal extends FirebaseApp {
    container?: {
        getProvider(name: string): {
            isInitialized(): boolean;
            getImmediate(): Auth;
        };
    };
}

const firebaseApp: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

GoogleSignin.configure({
    webClientId: firebaseConfig.googleClientId,
    scopes: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
    offlineAccess: false,
});

const getInternalAuth = (): Auth => {
    if (Platform.OS === "web") {
        return getAuth(firebaseApp);
    }

    const appAny = firebaseApp as FirebaseAppInternal;
    const authProvider = appAny.container?.getProvider("auth");

    if (authProvider?.isInitialized()) {
        return authProvider.getImmediate();
    }

    const persistence = createAsyncStorage("app");

    return initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(persistence),
    });
};

const auth = getInternalAuth();

// Remote Config lives in `remoteConfigClient.ts` / `.web.ts` so the feature flag
// plumbing stays out of the auth setup and can differ per platform.

export { firebaseApp, auth };

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);
