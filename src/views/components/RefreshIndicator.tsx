import { RefreshControl, RefreshControlProps } from "react-native";
import { useTheme } from "@/styles/ThemeProvider";

export function RefreshIndicator({
    refreshing,
    onRefresh,
    ...props
}: RefreshControlProps) {
    const { COLORS } = useTheme();
    return (
        <RefreshControl
            colors={[COLORS.primary]}
            refreshing={refreshing}
            onRefresh={onRefresh}
            {...props}
        />
    );
}
