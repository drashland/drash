/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import type { Config } from "@jest/types";
import { getTestDirectory } from "./jest.config.utils.mjs";

const testDirectory = getTestDirectory("cloudflare");

console.log(`\nRunning tests in cloudflare/${testDirectory} directory\n`);

const config: Config.InitialOptions = {
  testMatch: [
    `**/cloudflare/${testDirectory}/**/(*.)+(test).+(ts|tsx)`,
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "./tests/compat/cloudflare/tsconfig.json",
      },
    ],
  },
};

export default config;
