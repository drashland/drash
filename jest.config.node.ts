/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import type { Config } from "@jest/types";
import { getTestDirectory } from "./jest.config.utils.mjs";

const testDirectory = getTestDirectory("node");

console.log(`\nRunning tests in node/${testDirectory} directory\n`);

const config: Config.InitialOptions = {
  testMatch: [
    `**/node/${testDirectory}/**/(*.)+(test).+(ts|tsx)`,
  ],
  transform: {
    "^.+\\.(ts|tsx)?$": [
      "ts-jest",
      {
        tsconfig: "./tests/compat/node/tsconfig.json",
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};

export default config;
