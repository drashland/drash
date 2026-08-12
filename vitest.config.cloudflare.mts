import { defineConfig } from "vitest/config";
import { getTestDirectory } from "./vitest.config.utils.mts";

const testDirectory = getTestDirectory("cloudflare");

console.log(`\nRunning tests in cloudflare/${testDirectory} directory\n`);

export default defineConfig({
  test: {
    // The compat tests use the `describe`/`it`/`expect` globals rather than
    // importing them, so they read the same across all four runtimes.
    globals: true,
    environment: "node",
    include: [
      `tests/compat/cloudflare/${testDirectory}/**/*.test.ts`,
    ],
    // Each suite boots a real workerd process via wrangler's `unstable_dev`,
    // which does not reliably finish within the default 5s.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
