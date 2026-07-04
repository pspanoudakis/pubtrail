import { RefreshControl, RefreshControlProps } from "react-native";
import { COLORS } from "@/styles/theme";

export function RefreshIndicator({
    refreshing,
    onRefresh,
    ...props
}: RefreshControlProps) {
    return (
        <RefreshControl
            colors={[COLORS.primary]}
            refreshing={refreshing}
            onRefresh={onRefresh}
            {...props}
        />
    );
}
