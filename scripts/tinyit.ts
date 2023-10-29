const packageJsonContents = new TextDecoder().decode(
  Deno.readFileSync("./package.json"),
);

const packageJson = JSON.parse(packageJsonContents);

const {
    devDependencies,
    scripts,
    ...rest
} = packageJson;


Deno.writeFileSync("./lib/package.json", new TextEncoder().encode(JSON.stringify(rest, null, 2)));
