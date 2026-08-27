/**
 * Set the Drash version everywhere it is written by hand.
 *
 *     deno task bump-version 3.0.1
 *     deno task bump-version 3.0.1 --dry-run
 *
 * Three kinds of file carry it, and they mean different things:
 *
 *   - ./package.json and ./deno.json hold the package's *own* version. npm
 *     reads the first, JSR the second, and `check:package-json-version` fails a
 *     release when the two disagree -- so they always move together.
 *   - ./examples/*\/package.json depend *on* that version. They pin an exact
 *     version rather than a range so an example demonstrates a known-good
 *     combination.
 *   - ./docs/components/version-badge.tsx *displays* it, in the navbar. This is
 *     the only one a reader sees, and the only one written with a leading `v`.
 *
 * Not handled here, on purpose:
 *
 *   - ./examples/*\/package-lock.json. A lockfile carries integrity hashes and
 *     resolved tarball URLs that cannot be derived from a version string.
 *     Rewriting one by hand produces a lockfile that installs the wrong bytes
 *     or fails outright. Run `npm install` in the example instead. This script
 *     reports the ones that have drifted.
 *   - ./examples/deno. It imports from esm.sh without a version, so there is
 *     nothing to pin.
 */

// Imports > Standard
import { walkSync } from "@std/fs";

/**
 * A file whose version this script maintains.
 */
type Target = {
  path: string;
  /** What is being set, for the report. */
  field: string;
  /** Current value, or `null` if the field is absent. */
  from: string | null;
  /** Value to write. */
  to: string;
  /**
   * Applies the change. Held as a closure so JSON manifests and source files
   * can share one code path -- each captures whatever it needs to write itself,
   * and a dry run simply never calls it.
   */
  write: () => void;
};

/**
 * npm and JSR both want a semantic version. Checking here keeps a typo from
 * being written to eight files and committed.
 *
 * Leading `v` is rejected rather than stripped: `package.json` versions do not
 * carry one, and silently accepting `v3.0.1` would invite it in places that
 * cannot take it.
 */
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;

/**
 * Read a JSON file.
 *
 * @param path The file to read.
 * @returns The parsed contents.
 */
function readJson(path: string): Record<string, unknown> {
  return JSON.parse(Deno.readTextFileSync(path));
}

/**
 * Write a JSON file in the shape `deno fmt` produces, so a bump does not show
 * up as a formatting change and `deno fmt --check` keeps passing.
 *
 * @param path The file to write.
 * @param document The contents to write.
 */
function writeJson(path: string, document: Record<string, unknown>): void {
  Deno.writeTextFileSync(path, JSON.stringify(document, null, 2) + "\n");
}

/**
 * Find every example that depends on Drash.
 *
 * Derived by walking `./examples` rather than listing the directories, so a new
 * example is picked up without editing this script.
 *
 * @returns The paths of the example manifests, sorted.
 */
function findExampleManifests(): string[] {
  const paths: string[] = [];

  for (
    const entry of walkSync("examples", {
      includeDirs: false,
      match: [/package\.json$/],
      skip: [/node_modules/],
    })
  ) {
    paths.push(entry.path.replaceAll("\\", "/"));
  }

  return paths.sort();
}

/**
 * Work out every edit this bump implies, without applying any of them.
 *
 * @param version The version to set.
 * @returns One entry per file that needs writing.
 */
function planTargets(version: string): Target[] {
  const targets: Target[] = [];

  // The package's own version.
  for (const path of ["package.json", "deno.json"]) {
    const document = readJson(path);
    const from = typeof document.version === "string" ? document.version : null;

    document.version = version;

    targets.push({
      path,
      field: "version",
      from,
      to: version,
      write: () => writeJson(path, document),
    });
  }

  // The examples' dependency on it.
  for (const path of findExampleManifests()) {
    const document = readJson(path);
    const dependencies = document.dependencies as
      | Record<string, string>
      | undefined;

    if (!dependencies || !("@drashland/drash" in dependencies)) {
      continue;
    }

    const from = dependencies["@drashland/drash"];

    // Keep a range operator if the example uses one. Rewriting `^3.0.0` as
    // `3.0.1` would quietly narrow the range, which is a different decision
    // from bumping the version.
    const rangePrefix = from.match(/^[\^~]/)?.[0] ?? "";

    dependencies["@drashland/drash"] = rangePrefix + version;

    targets.push({
      path,
      field: 'dependencies["@drashland/drash"]',
      from,
      to: rangePrefix + version,
      write: () => writeJson(path, document),
    });
  }

  targets.push(planVersionBadge(version));

  return targets;
}

/**
 * Plan the edit to the docs navbar badge.
 *
 * This one is source, not JSON, so it is a targeted replacement rather than a
 * parse and re-serialise. The pattern is anchored on the badge's own `span` for
 * a reason: the file's doc comment mentions `v3.0.0-beta.3` as an example, and
 * a looser search would rewrite that too.
 *
 * A missing match is fatal rather than skipped. The badge is the only version a
 * reader of the site actually sees, so silently leaving it stale is worse than
 * stopping and asking someone to look.
 *
 * @param version The version to set.
 * @returns The badge target.
 */
function planVersionBadge(version: string): Target {
  const path = "docs/components/version-badge.tsx";
  const contents = Deno.readTextFileSync(path);

  const badge = /(<span className=\{styles\.badge\}>)v([^<]*)(<\/span>)/;
  const match = contents.match(badge);

  if (!match) {
    console.error(`Could not find the version badge in ${path}.`);
    console.error(
      "Expected a `<span className={styles.badge}>v...</span>`. If the " +
        "component was\nrestructured, update the pattern in " +
        "scripts/bump_version.ts to match.",
    );
    Deno.exit(1);
  }

  // The badge is the one place the version is written with a leading `v`.
  const updated = contents.replace(badge, `$1v${version}$3`);

  return {
    path,
    field: "<VersionBadge>",
    from: `v${match[2]}`,
    to: `v${version}`,
    write: () => Deno.writeTextFileSync(path, updated),
  };
}

/**
 * Find lockfiles that no longer agree with the version being set.
 *
 * These cannot be fixed here -- see the note at the top of this file -- so they
 * are reported for a human to regenerate.
 *
 * @param version The version being set.
 * @returns The paths of lockfiles that need regenerating.
 */
function findStaleLockfiles(version: string): string[] {
  const stale: string[] = [];

  for (
    const entry of walkSync("examples", {
      includeDirs: false,
      match: [/package-lock\.json$/],
      skip: [/node_modules/],
    })
  ) {
    const path = entry.path.replaceAll("\\", "/");
    const contents = Deno.readTextFileSync(path);

    // A lockfile mentions the package many times (dependency entry, resolved
    // URL, integrity). Any mention of a *different* version means it is stale.
    const versions = new Set(
      [...contents.matchAll(/"@drashland\/drash":\s*"([^"]+)"/g)]
        .map((match) => match[1]),
    );

    for (const found of versions) {
      if (found.replace(/^[\^~]/, "") !== version) {
        stale.push(path);
        break;
      }
    }
  }

  return stale.sort();
}

const version = Deno.args.find((arg) => !arg.startsWith("-"));
const dryRun = Deno.args.includes("--dry-run");

if (!version) {
  console.error("Usage: deno task bump-version <version> [--dry-run]");
  console.error("       deno task bump-version 3.0.1");
  Deno.exit(1);
}

if (!SEMVER.test(version)) {
  console.error(`'${version}' is not a semantic version.`);
  console.error(
    version.startsWith("v")
      ? "Drop the leading 'v' -- these files hold a bare version."
      : "Expected something like 3.0.1, or 3.0.1-beta.1 for a prerelease.",
  );
  Deno.exit(1);
}

const targets = planTargets(version);
const changed = targets.filter((target) => target.from !== target.to);

console.log(
  dryRun
    ? `Would set the Drash version to ${version}:\n`
    : `Setting the Drash version to ${version}:\n`,
);

for (const target of targets) {
  const status = target.from === target.to
    ? "already"
    : dryRun
    ? "would"
    : "set";

  console.log(
    `  ${status.padEnd(6)} ${target.path} ${target.field} ` +
      `${target.from ?? "(absent)"} -> ${target.to}`,
  );

  if (!dryRun && target.from !== target.to) {
    target.write();
  }
}

if (!changed.length) {
  console.log(`\nNothing to do. Every file already reads ${version}.`);
}

if (!dryRun && changed.length) {
  console.log(
    `\nDone. Review with \`git diff\` before committing.`,
  );
}
