// Shared helper for `vitest.config.node.mts` and `vitest.config.cloudflare.mts`.

import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Resolve the `node-v*.x` test directory to run for the current Node version.
 *
 * Tests are split by Node version (e.g., `node-v20.x`). Prefer an exact match
 * for the running Node version. Otherwise fall back to the newest directory
 * that is not ahead of it, so newer Node versions run the suite instead of
 * silently matching nothing.
 *
 * @param suite The directory under `tests/compat` to resolve within.
 *
 * @returns The name of the directory to run (e.g., `node-v20.x`).
 */
export function getTestDirectory(suite: "cloudflare" | "node"): string {
  console.log(`\nNode version: ${process.version}\n`);

  const matchedVersion = process.version.match(/v([0-9]+)/);

  if (!matchedVersion) {
    console.log(
      `\nFailed to get test directory. \`process.version\` match returned ${matchedVersion}.\n`,
    );
    process.exit(1);
  }

  const major = Number(matchedVersion[1]);
  const available = readdirSync(join(process.cwd(), "tests", "compat", suite), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name.match(/^node-v([0-9]+)\.x$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => Number(match[1]))
    .sort((a, b) => a - b);

  if (available.length === 0) {
    console.log(
      `\nFailed to get test directory. No \`node-v*.x\` directories in tests/compat/${suite}.\n`,
    );
    process.exit(1);
  }

  const resolved = available.includes(major)
    ? major
    : available.filter((version) => version <= major).pop() ?? available[0];

  if (resolved !== major) {
    console.log(
      `\nNo node-v${major}.x directory. Falling back to node-v${resolved}.x.\n`,
    );
  }

  return `node-v${resolved}.x`;
}
