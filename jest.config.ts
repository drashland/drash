/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import type { Config } from "@jest/types";

let directorySuffix = getDirectorySuffix();

console.log(`\nRunning tests in 'node${directorySuffix}' directory\n`)

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
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    `**/node${directorySuffix}/**/?(*.)+(spec|test).[jt]s?(x)`,
  ],
  transform: {
    "^.+\\.(ts|tsx)?$": [
      "ts-jest",
      { tsconfig: "./tests/tsconfig.json" },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};

export default config;


function getDirectorySuffix() {
  const matchedVersion = process.version.match(/v[0-9]+/);

  let version = "18";

  if (matchedVersion && matchedVersion[0]) {
    version = matchedVersion[0];
  }

  const supportedVersion = [
    "16",
    "18",
  ];

  version = version.replace("v", "");

  if (!supportedVersion.includes(version)) {
    version = "18";
  }

  return "-" + version;
}
