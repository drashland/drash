// Overview
//
// Updates deno version strings in files.
// This scripts main purpose is to aid the `bumper`,
// removing any extra manual work when we bump the deno version

let fileContent: string = ""
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const fetchRes = await fetch("https://cdn.deno.land/deno/meta/versions.json");
const versions: {
  latest: string,
  versions: string[]
} = await fetchRes.json() // eg { latest: "v1.3.3", versions: ["v1.3.2", ...] }
const latestDenoVersion = versions.latest.replace('v', '')
console.log(latestDenoVersion)

// Master workflow
fileContent = decoder.decode(await Deno.readFile("./.github/workflows/master.yml"));
fileContent = fileContent.replace(/deno: ["[0-9.]+[0-9.]+[0-9]"]/, `deno: ["${latestDenoVersion}"]`)
await Deno.writeFile("./.github/workflows/master.yml", encoder.encode(fileContent))

// Bumper workflow
fileContent = decoder.decode(await Deno.readFile("./.github/workflows/bumper.yml"));
fileContent = fileContent.replace(/deno: ["[0-9.]+[0-9.]+[0-9]"]/, `deno: ["${latestDenoVersion}"]`)
await Deno.writeFile("./.github/workflows/bumper.yml", encoder.encode(fileContent))