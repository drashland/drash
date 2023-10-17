const versionToPublish = Deno.args[0];

const packageJsonContents = new TextDecoder().decode(
  Deno.readFileSync("./package.json"),
);

const packageJson = JSON.parse(packageJsonContents);
const packageJsonVersion = `v${packageJson.version}`;

console.log("\n");
console.log("/////////////////////////////////////////")
console.log("//////////// MOMENT OF TRUTH ////////////")
console.log("/////////////////////////////////////////")

console.log("Checking package.json version with GitHub release tag version ...\n");

console.log(`package.json version:   ${packageJsonVersion}`);
console.log(`GitHub release version: ${versionToPublish}\n`);

if (packageJsonVersion !== versionToPublish) {
  console.log("!! Version mismatch !!");
  console.log("!! Version mismatch !!");
  console.log("!! Version mismatch !!");
  console.log("\n\nStopping release process\n\n");
  console.log("!! Version mismatch !!");
  console.log("!! Version mismatch !!");
  console.log("!! Version mismatch !!");
  Deno.exit(1);
} else {
  console.log("Versions match")
  console.log("\n\nProceeding with release workflow\n\n");
}
