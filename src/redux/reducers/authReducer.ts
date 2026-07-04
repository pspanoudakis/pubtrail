import type { AuthUserState } from "@/redux/types/auth";

const initialState = {
    email: "",
    password: "",
    user: null as AuthUserState | null,
    loading: false,
    error: null as string | null,
    isSignUp: false,
    sessionChecked: false,
};

export type AuthState = typeof initialState;

type AuthAction =
    | { type: "AUTH_SET_EMAIL"; payload: string }
    | { type: "AUTH_SET_PASSWORD"; payload: string }
    | { type: "AUTH_SET_IS_SIGN_UP"; payload: boolean }
    | { type: "AUTH_LOADING" }
    | { type: "AUTH_SUCCESS"; payload: AuthUserState | null }
    | { type: "AUTH_ERROR"; payload: string }
    | { type: "AUTH_LOGOUT" }
    | { type: "AUTH_SESSION_CHECKED" };

const authReducer = (state = initialState, action: AuthAction): AuthState => {
    switch (action.type) {
        case "AUTH_SET_EMAIL":
            return { ...state, email: action.payload };
        case "AUTH_SET_PASSWORD":
            return { ...state, password: action.payload };
        case "AUTH_SET_IS_SIGN_UP":
            return { ...state, isSignUp: action.payload };
        case "AUTH_LOADING":
            return { ...state, loading: true, error: null };
        case "AUTH_SUCCESS":
            return { ...state, loading: false, user: action.payload, password: "", sessionChecked: true };
        case "AUTH_ERROR":
            return { ...state, loading: false, error: action.payload, sessionChecked: true };
        case "AUTH_LOGOUT":
            return { ...initialState, sessionChecked: true };
        case "AUTH_SESSION_CHECKED":
            return { ...state, sessionChecked: true };
        default:
            return state;
    }
};

export default authReducer;
