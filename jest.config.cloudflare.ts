/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import type { Config } from "@jest/types";

const testDirectory = getTestDirectory();

console.log(`\nRunning tests in cloudflare/${testDirectory} directory\n`);

const config: Config.InitialOptions = {
  testMatch: [
    `**/cloudflare/${testDirectory}/**/(*.)+(test).+(ts|tsx)`,
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};

export default config;

function getTestDirectory() {
  console.log(`\nNode version: ${process.version}\n`);

  const matchedVersion = process.version.match(/v[0-9]+/);

  if (!matchedVersion) {
    console.log(
      `\nFailed to get test directory. \`process.version\` match returned ${matchedVersion}.\n`,
    );
    process.exit(1);
  }

  return "node-" + matchedVersion[0] + ".x";
}
