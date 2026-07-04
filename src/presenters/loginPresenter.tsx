import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import {
    setEmail,
    setPassword,
    signInWithGoogle,
    submitAuth,
    toggleSignUpMode,
} from "@/redux/actions/authActions";
import { LoginView } from "@/views/loginView";

export function LoginPresenter() {
    const auth = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    return (
        <LoginView
            email={auth.email}
            password={auth.password}
            isSignUp={auth.isSignUp}
            loading={auth.loading}
            error={auth.error}
            onEmailChange={onEmailChangeACB}
            onPasswordChange={onPasswordChangeACB}
            onToggleMode={onToggleModeACB}
            onSubmit={onSubmitACB}
            onGoogleSubmit={onGoogleSubmitACB}
        />
    );

    function onEmailChangeACB(email: string) {
        dispatch(setEmail(email));
    }

    function onPasswordChangeACB(password: string) {
        dispatch(setPassword(password));
    }

    function onToggleModeACB() {
        dispatch(toggleSignUpMode());
    }

    function onSubmitACB() {
        dispatch(submitAuth());
    }

    function onGoogleSubmitACB() {
        dispatch(signInWithGoogle());
    }
}
