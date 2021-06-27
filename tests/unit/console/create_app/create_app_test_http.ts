/**
 * Test needs the following flags: --allow-read --allow-run --allow-write
 *
 * Will make a tmp directory in the root of this project, cd into it and create files there.
 * This is only for some tests
 */

import { Rhum } from "../deps.ts";
import { green, red } from "../../deps.ts";
import { testMethods } from "./test_methods.ts";

let branch = Deno.env.get("GITHUB_HEAD_REF");
if (!branch || branch.trim() == "") {
  branch = "master";
}
const githubOwner = Deno.env.get("GITHUB_ACTOR") ?? "drashland"; // possible it's the user and not drashland
const repository = "deno-drash";
// supports forks
let drashUrl =
  `https://raw.githubusercontent.com/${githubOwner}/${repository}/${branch}`;

// if fork doesnt exist, use drashland repo. An instance where this can happen
// is if I (Edward) make a PR to drashland NOT from a fork, the github owner
// will be "ebebbington" which it shouldn't be, it should be drashland
try {
  const res = await fetch(`${drashUrl}/create_app.ts`);
  await res.text();
  if (res.status !== 200) {
    drashUrl =
      `https://raw.githubusercontent.com/drashland/deno-drash/${branch}`;
  }
} catch (err) {
  // do nothing
}

testMethods("http", {
  base_url: drashUrl,
  branch: branch,
  github_owner: githubOwner,
  repository: repository,
});
