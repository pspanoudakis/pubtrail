import { remoteConfigValues } from "@/firebaseConfig";
import * as defaultTheme from "./theme.default";
import * as altTheme from "./theme.alt";

const useAltTheme = remoteConfigValues.newThemeTest === "true";
const activeTheme = useAltTheme ? altTheme : defaultTheme;

export const COLORS = activeTheme.COLORS;

export const SPACING = activeTheme.SPACING;

export const TYPOGRAPHY = activeTheme.TYPOGRAPHY;

export const RADIUS = activeTheme.RADIUS;
