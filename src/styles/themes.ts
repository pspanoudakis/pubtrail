import * as altTokens from "./theme.alt";
import * as defaultTokens from "./theme.default";

/**
 * Colours are widened to `string` because the two palettes hold different
 * literals. Spacing, typography and radius are identical across themes, so they
 * keep their literal types - `TYPOGRAPHY.weights` in particular has to stay
 * literal for React Native to accept it as a `fontWeight`.
 */
export type Theme = {
    COLORS: Record<keyof typeof defaultTokens.COLORS, string>;
    SPACING: typeof defaultTokens.SPACING;
    TYPOGRAPHY: typeof defaultTokens.TYPOGRAPHY;
    RADIUS: typeof defaultTokens.RADIUS;
};

export const defaultTheme: Theme = {
    COLORS: defaultTokens.COLORS,
    SPACING: defaultTokens.SPACING,
    TYPOGRAPHY: defaultTokens.TYPOGRAPHY,
    RADIUS: defaultTokens.RADIUS,
};

export const altTheme: Theme = {
    COLORS: altTokens.COLORS,
    SPACING: altTokens.SPACING,
    TYPOGRAPHY: altTokens.TYPOGRAPHY,
    RADIUS: altTokens.RADIUS,
};
