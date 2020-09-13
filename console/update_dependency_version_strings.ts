// Overview
//
// Updates deno version strings in files.
// This scripts main purpose is to aid the `bumper`,
// removing any extra manual work when we bump the deno version

let fileContent = "";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
let fetchRes = await fetch("https://cdn.deno.land/deno/meta/versions.json");
let versions: {
  latest: string;
  versions: string[];
} = await fetchRes.json(); // eg { latest: "v1.3.3", versions: ["v1.3.2", ...] }
const latestDenoVersion = versions.latest.replace("v", "");
fetchRes = await fetch("https://cdn.deno.land/drash/meta/versions.json");
versions = await fetchRes.json();
const latestDrashVersion = versions.latest;

// Master workflow
fileContent = decoder.decode(
  await Deno.readFile("./.github/workflows/master.yml"),
);
fileContent = fileContent.replace(
  /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
  `deno: ["${latestDenoVersion}"]`,
);
await Deno.writeFile(
  "./.github/workflows/master.yml",
  encoder.encode(fileContent),
);

// Bumper workflow
fileContent = decoder.decode(
  await Deno.readFile("./.github/workflows/bumper.yml"),
);
fileContent = fileContent.replace(
  /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
  `deno: ["${latestDenoVersion}"]`,
);
await Deno.writeFile(
  "./.github/workflows/bumper.yml",
  encoder.encode(fileContent),
);

// CSRF Readme, the drash version
fileContent = decoder.decode(
  await Deno.readFile("./csrf/README.md"),
);
fileContent = fileContent.replace(
  /drash@[0-9.]+[0-9.]+[0-9]/g,
  `drash@${latestDrashVersion}`,
);
await Deno.writeFile(
  "./csrf/README.md",
  encoder.encode(fileContent),
);

// Dexter Readme, the drash version
fileContent = decoder.decode(
  await Deno.readFile("./dexter/README.md"),
);
fileContent = fileContent.replace(
  /drash@[0-9.]+[0-9.]+[0-9]/g,
  `drash@${latestDrashVersion}`,
);
await Deno.writeFile(
  "./dexter/README.md",
  encoder.encode(fileContent),
);

// Paladin Readme, the drash version
fileContent = decoder.decode(
  await Deno.readFile("./paladin/README.md"),
);
fileContent = fileContent.replace(
  /drash@[0-9.]+[0-9.]+[0-9]/g,
  `drash@${latestDrashVersion}`,
);
await Deno.writeFile(
  "./paladin/README.md",
  encoder.encode(fileContent),
);
