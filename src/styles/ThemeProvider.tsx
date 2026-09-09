import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { getFeatureFlag } from "@/featureFlags";
import { altTheme, defaultTheme, type Theme } from "./themes";

/**
 * The active theme is chosen once, from a feature flag that the root layout has
 * already resolved before rendering this provider. It stays fixed for the app
 * session, so a flag change applies on the next start.
 */
const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({ children }: { children: ReactNode }): ReactElement {
    const theme = getFeatureFlag("newThemeTest") ? altTheme : defaultTheme;

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
    return useContext(ThemeContext);
}
