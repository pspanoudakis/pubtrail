import { useTheme } from "./ThemeProvider";
import type { Theme } from "./themes";

/**
 * Turns a stylesheet factory into a hook. Replaces module-scope
 * `StyleSheet.create` calls, which capture theme tokens at import time and so
 * cannot follow the active theme.
 *
 * Results are cached per theme object, so a stylesheet is built once per theme
 * rather than on every render.
 */
export function createThemedStyles<T>(factory: (theme: Theme) => T): () => T {
    const cache = new WeakMap<Theme, T>();

    return function useThemedStyles(): T {
        const theme = useTheme();
        let styles = cache.get(theme);

        if (!styles) {
            styles = factory(theme);
            cache.set(theme, styles);
        }

        return styles;
    };
}
