import { defineConfig } from "vitest/config";
import { getTestDirectory } from "./vitest.config.utils.mts";

const testDirectory = getTestDirectory("node");

console.log(`\nRunning tests in node/${testDirectory} directory\n`);

export default defineConfig({
  test: {
    // The compat tests use the `describe`/`it`/`expect` globals rather than
    // importing them, so they read the same across all four runtimes.
    globals: true,
    environment: "node",
    include: [
      `tests/compat/node/${testDirectory}/**/*.test.ts`,
    ],
  },
});
