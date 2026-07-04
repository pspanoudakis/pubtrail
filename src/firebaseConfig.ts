import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app"
import {
    initializeAuth,
    //@ts-ignore
    getReactNativePersistence,  // Method exists on native, compiler complains about web, but we don't use it there.
    type Auth, getAuth
} from 'firebase/auth';
import { firebaseConfig } from "@/firebaseEnv";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {GoogleSignin} from "@react-native-google-signin/google-signin";

// node_modules/@firebase/app/dist/app.d.ts (Private api)
interface FirebaseAppInternal extends FirebaseApp {
    container?: {
        getProvider(name: string): {
            isInitialized(): boolean;
            getImmediate(): Auth;
        };
    };
}
const firebaseApp: FirebaseApp  = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Set the Web Client ID for token verification
// Navive login prompt
GoogleSignin.configure({
    webClientId: firebaseConfig.googleClientId,
    scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
    offlineAccess: false,
});
const getInternalAuth = (): Auth => {
    if (Platform.OS === "web") {
        return getAuth(firebaseApp);
    }
    // Check if Auth has already been initialized to prevent Hot-Reload errors
    // Not needed in prod app
    const appAny = firebaseApp as FirebaseAppInternal;
    const authProvider = appAny.container?.getProvider("auth");

    if (authProvider?.isInitialized()) {
        return authProvider.getImmediate();
    }

    const persistence = createAsyncStorage("app");

    // Initialize for the first time
    return initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(persistence),
    });
};

const auth = getInternalAuth();
export { firebaseApp, auth };

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);
