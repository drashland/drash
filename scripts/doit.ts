function run(cb: () => void) {
  try {
    cb();
  } catch (e) {
    console.log(e instanceof Error ? e.message : e);
  }
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

Deno.copyFileSync(`deno.jsr.json`, `dist/deno.json`);

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
