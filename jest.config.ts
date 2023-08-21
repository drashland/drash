/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    // Allow `import ... from "@/*"` imports. Used in tandem with
    // `tests/tsconfig.json#compilerOptions.paths`
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)?$": [
      "ts-jest",
      { tsconfig: "./tests/tsconfig.json" },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};

export default config;
