import { Rhum } from "https://raw.githubusercontent.com/drashland/rhum/rhum-cli/mod.ts";
import {
  denoVersionFiles,
  moduleVersionFiles,
} from "../../../console/bumper_ci_service_files.ts";
import { BumperService } from "../../../deps.ts";

// Not for pre-release
const b = new BumperService("dmm", Deno.args);

// For pre-release
const c = new BumperService("dmm", ["--version=1.2.3"]);

const latestVersions = await b.getLatestVersions();
const latestVersionDrash = await c.getModulesLatestVersion("drash");

Rhum.testPlan(async () => {

  /**
   * The test cases in this test suite process as follows:
   *
   *   1. Take a file.
   *   2. Switch out the file for the test file. This test file mocks different
   *      patterns that the regex SHOULD match and replace.
   *   3. Bump the file.
   *   4. Assert that everything is as expected.
   */
  await Rhum.testSuite(
    "bumper_ci_service.ts",
    () => {
      Rhum.testCase("bumps std versions in deps files correctly", async () => {
        const file = denoVersionFiles[0];
        file.filename = "./tests/data/pattern_types.txt";
        const bumped = await b.bump([file], false);
        Rhum.asserts.assertEquals(bumped[0], data_depsStd);
      });

      Rhum.testCase("bumps drash versions in deps files correctly", async () => {
        const file = denoVersionFiles[1];
        file.filename = "./tests/data/pattern_types.txt";
        const bumped = await b.bump([file], false);
        Rhum.asserts.assertEquals(bumped[0], data_depsDrash);
      });

      Rhum.testCase("bumps deno versions in yml files correctly", async () => {
        const file = denoVersionFiles[2];
        file.filename = "./tests/data/pattern_types.txt";
        const bumped = await b.bump([file], false);
        Rhum.asserts.assertEquals(bumped[0], data_denoVersionsYml);
      });

      Rhum.testCase("bumps egg.json correctly", async () => {
        const file = moduleVersionFiles[0];
        file.filename = "./tests/data/pattern_types.txt";
        const bumped = await c.bump([file], false);
        Rhum.asserts.assertEquals(bumped[0], data_eggJson);
      });

      Rhum.testCase("bumps const statements correctly", async () => {
        const file = moduleVersionFiles[2];
        file.filename = "./tests/data/pattern_types.txt";
        const bumped = await c.bump([file], false);
        Rhum.asserts.assertEquals(bumped[0], data_constStatements);
      });
    },
  );
});

////////////////////////////////////////////////////////////////////////////////
// DATA PROVIDERS //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const data_depsStd = `workflow files

deno: ["0.0.0"]
deno: ["0.0.0"]

-----

urls

https://deno.land/x/dmm@v0.0.0/mod.ts
https://deno.land/x/dmm@v0.0.0/mod.ts

----

consts

export const version = "0.0.0";
export const version = "0.0.0";

----

egg.json

"version": "0.0.0",

----

deps files

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts"; // up to date
import * as fs from "https://deno.land/std@${latestVersions.deno_std}/fs/mod.ts"; // up to date
import * as colors from "https://deno.land/std@${latestVersions.deno_std}/fmt/colors.ts"; // up to date
export { v4 } from "https://deno.land/std@${latestVersions.deno_std}/uuid/mod.ts"; // up to date
`;

const data_depsDrash = `workflow files

deno: ["0.0.0"]
deno: ["0.0.0"]

-----

urls

https://deno.land/x/dmm@v0.0.0/mod.ts
https://deno.land/x/dmm@v0.0.0/mod.ts

----

consts

export const version = "0.0.0";
export const version = "0.0.0";

----

egg.json

"version": "0.0.0",

----

deps files

import { Drash } from "https://deno.land/x/drash@v${latestVersionDrash}/mod.ts"; // up to date
import * as fs from "https://deno.land/std@0.0.0/fs/mod.ts"; // up to date
import * as colors from "https://deno.land/std@0.0.0/fmt/colors.ts"; // up to date
export { v4 } from "https://deno.land/std@0.0.0/uuid/mod.ts"; // up to date
`;

const data_denoVersionsYml = `workflow files

deno: ["${latestVersions.deno}"]
deno: ["${latestVersions.deno}"]

-----

urls

https://deno.land/x/dmm@v0.0.0/mod.ts
https://deno.land/x/dmm@v0.0.0/mod.ts

----

consts

export const version = "0.0.0";
export const version = "0.0.0";

----

egg.json

"version": "0.0.0",

----

deps files

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts"; // up to date
import * as fs from "https://deno.land/std@0.0.0/fs/mod.ts"; // up to date
import * as colors from "https://deno.land/std@0.0.0/fmt/colors.ts"; // up to date
export { v4 } from "https://deno.land/std@0.0.0/uuid/mod.ts"; // up to date
`;

const data_constStatements = `workflow files

deno: ["0.0.0"]
deno: ["0.0.0"]

-----

urls

https://deno.land/x/dmm@v0.0.0/mod.ts
https://deno.land/x/dmm@v0.0.0/mod.ts

----

consts

export const version = "1.2.3";
export const version = "1.2.3";

----

egg.json

"version": "0.0.0",

----

deps files

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts"; // up to date
import * as fs from "https://deno.land/std@0.0.0/fs/mod.ts"; // up to date
import * as colors from "https://deno.land/std@0.0.0/fmt/colors.ts"; // up to date
export { v4 } from "https://deno.land/std@0.0.0/uuid/mod.ts"; // up to date
`;

const data_eggJson = `workflow files

deno: ["0.0.0"]
deno: ["0.0.0"]

-----

urls

https://deno.land/x/dmm@v0.0.0/mod.ts
https://deno.land/x/dmm@v0.0.0/mod.ts

----

consts

export const version = "0.0.0";
export const version = "0.0.0";

----

egg.json

"version": "1.2.3",

----

deps files

import { Drash } from "https://deno.land/x/drash@v0.0.0/mod.ts"; // up to date
import * as fs from "https://deno.land/std@0.0.0/fs/mod.ts"; // up to date
import * as colors from "https://deno.land/std@0.0.0/fmt/colors.ts"; // up to date
export { v4 } from "https://deno.land/std@0.0.0/uuid/mod.ts"; // up to date
`;

