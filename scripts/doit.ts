import { walkSync } from "@std/fs";

function run(cb: () => void) {
  try {
    cb();
  } catch (e) {
    console.log(e instanceof Error ? e.message : e);
  }
}

/**
 * Build the JSR `exports` map from the source tree.
 *
 * JSR requires every publicly importable module to be listed. Deriving the map
 * from `src` rather than maintaining it by hand means adding a file there
 * cannot silently leave it unpublishable -- and it keeps the JSR surface
 * identical to the npm one, where `package.json` has no `exports` map and every
 * subpath resolves.
 *
 * The specifiers drop the extension, so a JSR consumer writes
 * `@drashland/drash/modules/http.native` where an npm consumer writes
 * `@drashland/drash/modules/http.native.js`.
 *
 * JSR publishes the TypeScript in `src` directly. It does not read the `.d.mts`
 * files tsup emits, and tsup erases type-only modules to empty files, so the
 * built output in `dist` could never be what JSR serves.
 *
 * @param sourceDir The directory to walk, relative to the repo root.
 * @returns The `exports` map, sorted so the generated file is stable.
 */
function buildJsrExports(sourceDir: string): Record<string, string> {
  const entries: [string, string][] = [];

  for (
    const entry of walkSync(sourceDir, {
      exts: [".ts"],
      includeDirs: false,
    })
  ) {
    // `walkSync` yields host-native separators. JSR specifiers are POSIX.
    const path = entry.path.replaceAll("\\", "/");
    const relative = path.slice(`${sourceDir}/`.length);

    entries.push([
      `./${relative.replace(/\.ts$/, "")}`,
      `./${sourceDir}/${relative}`,
    ]);
  }

  // Sorted rather than filesystem-ordered: the output is a build artifact that
  // gets diffed, and walk order is not guaranteed across platforms.
  entries.sort(([a], [b]) => a.localeCompare(b));

  return Object.fromEntries(entries);
}

/**
 * Copy files into the dist directory.
 * @param files The files to copy.
 */
function copy(files: string[]) {
  for (const file of files) {
    console.log(`\nMoving ${file} to ./dist/${file}`);
    Deno.copyFileSync(`${file}`, `dist/${file}`);
  }
}

run(() => {
  Deno.removeSync("dist", { recursive: true });
});

run(() => {
  Deno.mkdirSync("dist");
});

// Copy all files to be included in the distributable

copy([
  "AUTHORS",
  "COPYING",
  "README.md",
]);

// Refresh the JSR `exports` map in ./deno.json.
//
// This writes a *tracked* file rather than something under ./dist, because
// `deno publish` reads ./deno.json and prefers it over a jsr.json sitting
// beside it -- there is no way to keep a separate JSR config at the repo root.
// JSR publishes ./src directly, so nothing here needs the build output.
//
// The formatting matches what `deno fmt` produces for this file, so a build
// that changes nothing leaves it byte-identical and does not churn git.

const denoConfigPath = "deno.json";

const denoConfig = JSON.parse(
  new TextDecoder().decode(Deno.readFileSync(denoConfigPath)),
);

denoConfig.exports = buildJsrExports("src");

console.log(
  `\nWriting ./${denoConfigPath} with ${
    Object.keys(denoConfig.exports).length
  } exports`,
);

Deno.writeFileSync(
  denoConfigPath,
  new TextEncoder().encode(JSON.stringify(denoConfig, null, 2) + "\n"),
);

// Slim down the package.json file before putting it into the distributable

const packageJsonContents = new TextDecoder().decode(
  Deno.readFileSync("package.json"),
);

const packageJson = JSON.parse(packageJsonContents);

// These fields describe how this repo is developed, not how the published
// package is consumed. `engines` in particular is driven by the dev toolchain
// (vite, via vitest), so publishing it would constrain consumers to a Node
// range that Drash itself does not require.
const {
  devDependencies,
  engines,
  packageManager,
  pnpm,
  scripts,
  ...rest
} = packageJson;

Deno.writeFileSync(
  "dist/package.json",
  new TextEncoder().encode(JSON.stringify(rest, null, 2)),
);
