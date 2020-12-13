import { Rhum } from "../../deps.ts";
import {
  preReleaseFiles,
} from "../../../console/bumper_ci_service_files.ts";
import { BumperService } from "../../../deps.ts";

// Not for pre-release
const b = new BumperService("drash", Deno.args);

// For pre-release
const c = new BumperService("drash", ["--version=1.2.3"]);

const latestVersions = await b.getLatestVersions();

Rhum.testPlan("bumper_ci_service_test.ts", () => {
  /**
   * The test cases in this test suite process as follows:
   *
   *   1. Take a file.
   *   2. Switch out the file for the test file. This test file mocks different
   *      patterns that the regex SHOULD match and replace.
   *   3. Bump the file.
   *   4. Assert that everything is as expected.
   */
  Rhum.testSuite(
    "bumper_ci_service.ts",
    () => {
      Rhum.testCase("bumps egg.json correctly", async () => {
        let file = preReleaseFiles[0];
        file.filename = "tests/data/pattern_types.txt";
        const bumped = await c.bump([file], false);
        Rhum.asserts.assertEquals(bumped[0], data_eggJson);
      });

      Rhum.testCase("bumps drash import statements correctly", async () => {
        let file = preReleaseFiles[1];
        file.filename = "tests/data/pattern_types.txt";
        const bumped = await c.bump([file], false);
        Rhum.asserts.assertEquals(bumped[0], data_drashImports);
      });

      Rhum.testCase("bumps const statements correctly", async () => {
        let file = preReleaseFiles[2];
        file.filename = "tests/data/pattern_types.txt";
        const bumped = await c.bump([file], false);
        Rhum.asserts.assertEquals(bumped[0], data_constStatements);
      });
    },
  );
});

Rhum.run();

////////////////////////////////////////////////////////////////////////////////
// DATA PROVIDERS //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const data_drashImports = `workflow files

deno: ["0.0.0"]
deno: ["0.0.0"]

-----

import statements

import { Drash } from "https://deno.land/x/drash@v1.2.3/mod.ts";
import { Drash } from "https://deno.land/x/drash@v1.2.3/mod.ts";

----

consts

export const version = "v0.0.0";
export const version = "v0.0.0";

----

egg.json

"version": "0.0.0",

----

deps files

import { Drash } from "https://deno.land/x/drash@v1.2.3/mod.ts"; // up to date
`;

const data_denoVersionsYml = `workflow files

deno: ["${latestVersions.deno}"]
deno: ["${latestVersions.deno}"]

-----

import statements

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts";
import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts";

----

consts

export const version = "v0.0.0";
export const version = "v0.0.0";

----

egg.json

"version": "0.0.0",

----

deps files

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts"; // up to date
`;

const data_constStatements = `workflow files

deno: ["0.0.0"]
deno: ["0.0.0"]

-----

import statements

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts";
import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts";

----

consts

export const version = "v1.2.3";
export const version = "v1.2.3";

----

egg.json

"version": "0.0.0",

----

deps files

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts"; // up to date
`;

const data_eggJson = `workflow files

deno: ["0.0.0"]
deno: ["0.0.0"]

-----

import statements

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts";
import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts";

----

consts

export const version = "v0.0.0";
export const version = "v0.0.0";

----

egg.json

"version": "1.2.3",

----

deps files

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts"; // up to date
`;
