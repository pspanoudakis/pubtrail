import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from "@/styles/theme";

interface LoginViewProps {
    email: string;
    password: string;
    isSignUp: boolean;
    loading: boolean;
    error: string | null;
    onEmailChange: (email: string) => void;
    onPasswordChange: (password: string) => void;
    onToggleMode: () => void;
    onSubmit: () => void;
    onGoogleSubmit: () => void;
}

export function LoginView(props: LoginViewProps) {
    return (
        <View style={styles.container}>
            <Image
                source={require("../../assets/images/logo_regular.svg")}
                style={styles.logo}
                contentFit="contain"
            />
            <Text style={styles.title}>PubTrail</Text>
            <Text style={styles.subtitle}>
                {props.isSignUp ? "Create your account" : "Sign in to continue"}
            </Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={COLORS.textSecondary}
                    value={props.email}
                    onChangeText={onEmailChangeACB}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="username"
                    importantForAutofill="yes"
                    editable={!props.loading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textSecondary}
                    value={props.password}
                    onChangeText={onPasswordChangeACB}
                    onSubmitEditing={onSubmitACB}
                    secureTextEntry
                    autoCorrect={false}
                    autoComplete={props.isSignUp ? "new-password" : "password"}
                    textContentType={props.isSignUp ? "newPassword" : "password"}
                    importantForAutofill="yes"
                    editable={!props.loading}
                />

                {props.error ? <Text style={styles.error}>{props.error}</Text> : null}

                <Pressable
                    style={[styles.button, props.loading && styles.buttonDisabled]}
                    onPress={onSubmitACB}
                    disabled={props.loading}
                >
                    {props.loading ? (
                        <ActivityIndicator color={COLORS.surface} />
                    ) : (
                        <Text style={styles.buttonText}>
                            {props.isSignUp ? "Sign Up" : "Sign In"}
                        </Text>
                    )}
                </Pressable>

                <Pressable onPress={onToggleModeACB} disabled={props.loading}>
                    <Text style={styles.toggleText}>
                        {props.isSignUp
                            ? "Already have an account? Sign In"
                            : "Don't have an account? Sign Up"}
                    </Text>
                </Pressable>

                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                <Pressable
                    style={[styles.button, styles.googleButton, props.loading && styles.buttonDisabled]}
                    onPress={onGoogleSubmitACB}
                    disabled={props.loading}
                >
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                </Pressable>
            </View>
        </View>
    );

    function onEmailChangeACB(value: string) {
        props.onEmailChange(value);
    }

    function onPasswordChangeACB(value: string) {
        props.onPasswordChange(value);
    }

    function onSubmitACB() {
        props.onSubmit();
    }

    function onToggleModeACB() {
        props.onToggleMode();
    }

    function onGoogleSubmitACB() {
        props.onGoogleSubmit();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: SPACING.xl,
        backgroundColor: COLORS.background,
    },
    logo: {
        width: 200,
        height: 80,
        alignSelf: "center",
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.display,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text,
        textAlign: "center",
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginBottom: SPACING.xl,
    },
    form: {
        gap: SPACING.md,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + SPACING.xs,
        fontSize: TYPOGRAPHY.sizes.body,
        color: COLORS.text,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.sm + SPACING.xs,
        alignItems: "center",
        marginTop: SPACING.sm,
    },
    googleButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: 0,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    googleButtonText: {
        color: COLORS.text,
        fontSize: TYPOGRAPHY.sizes.body,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    error: {
        color: COLORS.error,
        fontSize: TYPOGRAPHY.sizes.small,
        textAlign: "center",
    },
    toggleText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.sizes.small,
        textAlign: "center",
        marginTop: SPACING.sm,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.sizes.small,
    },
});
