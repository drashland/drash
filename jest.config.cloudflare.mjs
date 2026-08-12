// This config is plain ESM JavaScript, not TypeScript. Jest loads a TypeScript
// config through ts-node, which type checks it. That fails on Node versions
// without native type stripping because `@jest/types` is not a direct
// dependency and so is not resolvable under pnpm's isolated `node_modules`.

import { getTestDirectory } from "./jest.config.utils.mjs";

const testDirectory = getTestDirectory("cloudflare");

console.log(`\nRunning tests in cloudflare/${testDirectory} directory\n`);

/** @type {import("jest").Config} */
const config = {
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
