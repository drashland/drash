const versionToPublish = Deno.args[0];

const packageJsonContents = new TextDecoder().decode(
  Deno.readFileSync("./package.json"),
);

const packageJson = JSON.parse(packageJsonContents);
const packageJsonVersion = `v${packageJson.version}`;

console.log("Checking package.json version with GitHub release tag version.\n");
console.log(`packge.json version:    ${packageJsonVersion}`);
console.log(`GitHub release version: ${versionToPublish}\n`);

if (packageJsonVersion !== versionToPublish) {
  console.log("Version mismatch. Stopping Release workflow.");
  Deno.exit(1);
} else {
  console.log("Versions match. Proceeding with Release workflow.");
}
