const versionToPublish = Deno.args[0];

const packageJsonContents = new TextDecoder().decode(
  Deno.readFileSync("./package.json"),
);

const packageJson = JSON.parse(packageJsonContents);
const packageJsonVersion = `v${packageJson.version}`;

console.log(`
/////////////////////////////////////////
//////////// MOMENT OF TRUTH ////////////
/////////////////////////////////////////
`);

console.log(`Checking package.json version with GitHub release tag version ...\n`);
console.log(`package.json version:   ${packageJsonVersion}`);
console.log(`GitHub release version: ${versionToPublish}`);

if (packageJsonVersion !== versionToPublish) {
  console.log(`
!! Version mismatch !!
!! Version mismatch !!
!! Version mismatch !!

Stopping release proces

!! Version mismatch !!
!! Version mismatch !!
!! Version mismatch !!
`);

  Deno.exit(1);
}

console.log(`
Versions match

Proceeding with release workflow. Godspeed.
`);
