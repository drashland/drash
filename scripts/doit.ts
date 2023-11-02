function run(cb: () => void) {
  try {
    cb();
  } catch (e) {
    console.log(e.message);
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

// Slim down the package.json file before putting it into the distributable

const packageJsonContents = new TextDecoder().decode(
  Deno.readFileSync("package.json"),
);

const packageJson = JSON.parse(packageJsonContents);

const {
  devDependencies,
  scripts,
  ...rest
} = packageJson;

Deno.writeFileSync(
  "dist/package.json",
  new TextEncoder().encode(JSON.stringify(rest, null, 2)),
);
