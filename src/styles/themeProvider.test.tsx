import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { StyleSheet, Text } from "react-native";

jest.mock("@/featureFlags", () => ({ getFeatureFlag: jest.fn() }));

import { getFeatureFlag } from "@/featureFlags";
import { ThemeProvider } from "@/styles/ThemeProvider";
import { createThemedStyles } from "@/styles/createThemedStyles";
import { HomeTile } from "@/views/components/HomeTile";

const useStyles = createThemedStyles(({ COLORS }) => StyleSheet.create({ probe: { color: COLORS.primary } }));

function Probe() {
    const styles = useStyles();
    return <Text style={styles.probe}>x</Text>;
}

const render = (ui: React.ReactElement): ReactTestRenderer => {
    let tree!: ReactTestRenderer;
    act(() => { tree = create(<ThemeProvider>{ui}</ThemeProvider>); });
    return tree;
};

describe("theme provider", () => {
    it("uses the default palette when the flag is off", () => {
        (getFeatureFlag as jest.Mock).mockReturnValue(false);
        const style = StyleSheet.flatten(render(<Probe />).root.findByType(Text).props.style);
        expect(style.color).toBe("#8b5e3c");
    });

    it("uses the alt palette when the flag is on", () => {
        (getFeatureFlag as jest.Mock).mockReturnValue(true);
        const style = StyleSheet.flatten(render(<Probe />).root.findByType(Text).props.style);
        expect(style.color).toBe("#4f46e5");
    });

    it("themes a real converted view", () => {
        (getFeatureFlag as jest.Mock).mockReturnValue(true);
        const tree = render(<HomeTile label="hi" icon={null} onPress={() => {}} />);
        const style = StyleSheet.flatten((tree.toJSON() as any).props.style);
        expect(style.backgroundColor).toBe("#ffffff");
        expect(style.borderColor).toBe("#bfdbfe");
    });
});
