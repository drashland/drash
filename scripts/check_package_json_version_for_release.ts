const packageJsonContents = new TextDecoder().decode(
  Deno.readFileSync("./package.json"),
);

const isManualRelease = Deno.args.includes("--manual-release");

const versionOptionIndex = Deno.args.indexOf("--version");

if (versionOptionIndex === -1) {
  console.log(`Option '--version=<version>' was not specified`);
  Deno.exit(1);
}

const versionToPublish = Deno.args[versionOptionIndex + 1];

console.log(`
/////////////////////////////////////////
//////////// MOMENT OF TRUTH ////////////
/////////////////////////////////////////


Running with script options:

  --manual-release: ${isManualRelease}
  --version:        ${versionToPublish}

`);

console.log(
  `Checking package.json version with GitHub release tag version ...`,
);

const packageJson = JSON.parse(packageJsonContents);
const packageJsonVersion = `v${packageJson.version}`;

console.log(`
  - package.json version:   ${packageJsonVersion}
  - GitHub release version: ${versionToPublish}
`);

if (packageJsonVersion !== versionToPublish) {
  console.log(`
!! Version mismatch !!
!! Version mismatch !!
!! Version mismatch !!

Stopping release process

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
