import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
    fetchAndActivate,
    getRemoteConfig,
    getValue,
} from "firebase/remote-config";

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
const remoteConfig = getRemoteConfig(firebaseApp);

const DEFAULT_REMOTE_CONFIG_VALUES: Record<string, boolean> = {
    useAltTheme: false,
};

const remoteConfigValues: Record<string, boolean> = { ...DEFAULT_REMOTE_CONFIG_VALUES };


export const initializeRemoteConfig = async (): Promise<Record<string, boolean>> => {
    if (!remoteConfig) {
        return remoteConfigValues;
    }

    remoteConfig.settings.minimumFetchIntervalMillis = 0; // 10 seconds for testing purposes, adjust as needed

    try {
        await fetchAndActivate(remoteConfig);
    } catch {
        return remoteConfigValues;
    }

    Object.keys(DEFAULT_REMOTE_CONFIG_VALUES).forEach((key) => {
        remoteConfigValues[key] = getValue(remoteConfig, key).asBoolean();
    });

    return remoteConfigValues;
};

export const getRemoteConfigValue = (key: string): boolean => {
    if (!remoteConfig) {
        return DEFAULT_REMOTE_CONFIG_VALUES[key] ?? false;
    }

    const value =  getValue(remoteConfig, key).asBoolean();
    console.log(`Remote config value for key "${key}": ${value}`);
    return value ?? DEFAULT_REMOTE_CONFIG_VALUES[key] ?? false;
};

if (Platform.OS === "web" && typeof indexedDB !== "undefined") {
    void initializeRemoteConfig();
}

export { firebaseApp, auth, remoteConfig, remoteConfigValues };

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);
