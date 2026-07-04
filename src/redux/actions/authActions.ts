import { auth } from "@/firebaseConfig";
import { ensureDocForUser } from "@/redux/gateways/userGateway";
import type { AppDispatch } from "@/redux/store/store";
import type { AuthUserState } from "@/redux/types/auth";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User as FirebaseUser
} from "firebase/auth";
import { GoogleSignin, User } from "@react-native-google-signin/google-signin";
import {Platform} from "react-native";

let unsubscribeAuthListener: (() => void) | null = null;

function serializeAuthUser(user: FirebaseUser): AuthUserState {
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        providerId: user.providerId ?? user.providerData[0]?.providerId ?? null,
    };
}

export function authSuccess(user: FirebaseUser) {
    return { type: "AUTH_SUCCESS", payload: serializeAuthUser(user) };
}

export function authError(error: string) {
    return { type: "AUTH_ERROR", payload: error };
}

export function authLoading() {
    return { type: "AUTH_LOADING" };
}

async function ensureFirestoreUserDocument(user: FirebaseUser): Promise<void> {
    await ensureDocForUser(user.uid, user.email ?? "", user.photoURL ?? "");
}

export function logout() {
    return async function logoutThunkACB(dispatch: AppDispatch) {
        try {
            await signOut(auth);
            if (Platform.OS !== 'web')  await GoogleSignin.signOut();
        } finally {
            dispatch({ type: "AUTH_LOGOUT" });
        }
    };
}

export function listenToAuthChanges() {
    return function listenThunkACB(dispatch: AppDispatch) {
        if (unsubscribeAuthListener) {
            unsubscribeAuthListener();
            unsubscribeAuthListener = null;
        }

        unsubscribeAuthListener = onAuthStateChanged(auth, function onAuthChangeACB(user: FirebaseUser | null) {
            if (user) {
                void (async () => {
                    try {
                        await ensureFirestoreUserDocument(user);
                    } finally {
                        dispatch(authSuccess(user));
                    }
                })();
                return;
            }

            dispatch({ type: "AUTH_LOGOUT" });
        });
    };
}



export function signInWithGoogle() {
    return async function signInWithGoogleThunkACB(dispatch: AppDispatch) {
        dispatch(authLoading());

        if (Platform.OS !== "web") {
            // Initialize Google Sign-In
            try {
                const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

                if (!googleClientId) {
                    dispatch(authError("Missing EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID in .env"));
                    return;
                }

                // Trigger the Google Sign-In flow
                await GoogleSignin.hasPlayServices();
                const response = await GoogleSignin.signIn();
                // @ts-ignore
                const userInfo: User = response.data;
                if (!userInfo.idToken) {
                    dispatch(authError("Google sign-in did not return an ID token."));
                    return;
                }

                // Create Firefbase credential from Google ID token
                const credential = GoogleAuthProvider.credential(userInfo.idToken);
                const userCredential = await signInWithCredential(auth, credential);
                await ensureFirestoreUserDocument(userCredential.user);
                dispatch(authSuccess(userCredential.user));
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes("Sign in action cancelled")) {
                        dispatch(authError("Google login was cancelled."));
                    } else {
                        dispatch(authError(error.message));
                    }
                } else {
                    dispatch(authError("An unknown error occurred"));
                }
            }
        }
        else {
            try {
                const provider = new GoogleAuthProvider();
                provider.setCustomParameters({ prompt: "select_account" });

                const userCredential = await signInWithPopup(auth, provider);
                await ensureFirestoreUserDocument(userCredential.user);
                dispatch(authSuccess(userCredential.user));
            } catch (error) {
                if (error instanceof Error) {
                    if (
                        error.message.includes("popup_closed_by_user") ||
                        error.message.includes("cancelled-popup-request")
                    ) {
                        dispatch(authError("Google login was cancelled."));
                    } else {
                        dispatch(authError(error.message));
                    }
                } else {
                    dispatch(authError("An unknown error occurred"));
                }
            }
        }
    };
}

export function setEmail(email: string) {
    return { type: "AUTH_SET_EMAIL", payload: email };
}

export function setPassword(password: string) {
    return { type: "AUTH_SET_PASSWORD", payload: password };
}

export function toggleSignUpMode() {
    return function toggleSignUpThunkACB(dispatch: AppDispatch, getState: () => { auth: { isSignUp: boolean } }) {
        const isSignUp = getState().auth.isSignUp;
        dispatch({ type: "AUTH_SET_IS_SIGN_UP", payload: !isSignUp });
    };
}

function mapAuthErrorMessage(code: string | undefined, fallback: string): string {
    switch (code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/missing-password":
            return "Please enter a password.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        case "auth/email-already-in-use":
            return "An account with this email already exists.";
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Incorrect email or password.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
        case "auth/operation-not-allowed":
            return "Email/password sign-in is not enabled for this project.";
        case "auth/network-request-failed":
            return "Network error. Please check your connection.";
        default:
            return fallback;
    }
}

export function submitEmailAuth() {
    return async function submitEmailAuthThunkACB(
        dispatch: AppDispatch,
        getState: () => { auth: { email: string; password: string; isSignUp: boolean } }
    ) {
        const { email, password, isSignUp } = getState().auth;

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            dispatch(authError("Please enter both email and password."));
            return;
        }

        dispatch(authLoading());

        try {
            const userCredential = isSignUp
                ? await createUserWithEmailAndPassword(auth, trimmedEmail, password)
                : await signInWithEmailAndPassword(auth, trimmedEmail, password);
            await ensureFirestoreUserDocument(userCredential.user);
            dispatch(authSuccess(userCredential.user));
        } catch (error) {
            const code = (error as { code?: string })?.code;
            const message = error instanceof Error ? error.message : "An unknown error occurred";
            dispatch(authError(mapAuthErrorMessage(code, message)));
        }
    };
}

export const submitAuth = submitEmailAuth;




