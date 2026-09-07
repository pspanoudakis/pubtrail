/**
 * Jest configuration for PubTrail.
 *
 * Uses Expo's official `jest-expo` preset, which wires up the React Native /
 * Expo module transforms, platform-file resolution (`*.native.ts` / `*.web.ts`)
 * and the standard `transformIgnorePatterns` for RN packages shipped as ESM.
 *
 * @type {import('jest').Config}
 */
module.exports = {
    preset: "jest-expo",

    // Mirror the `@/*` -> `src/*` alias from tsconfig.json so tests can use the
    // same import style as the app code.
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },

    // Co-locate tests next to the code they cover: `src/**/foo.test.ts`.
    testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],

    clearMocks: true,

    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};
