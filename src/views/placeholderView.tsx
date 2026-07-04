import { ReactElement } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";


export function PlaceholderView(): ReactElement {
    return (
        <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>This view is not implemented yet</Text>
            <Text style={styles.subtitle}>Temporary placeholder for your suggestions</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        gap: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
    },
    subtitle: {
        fontSize: 15,
        color: "#334155",
        marginBottom: 6,
    },
});
