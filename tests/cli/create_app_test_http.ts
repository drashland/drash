/**
 * Test needs the following flags: --allow-read --allow-run --allow-write
 *
 * Will make a tmp directory in the root of this project, cd into it and create files there.
 * This is only for some tests
 */

import { Rhum } from "../deps.ts";
import { green, red } from "../../deps.ts";

const tmpDirName = "tmp-dir-for-testing-create-app";
let tmpDirNameCount = 10;
const originalCWD = Deno.cwd();
const decoder = new TextDecoder("utf-8");
const branch = Deno.env.get("GITHUB_HEAD_REF") ?? "master";
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

/**
 * To keep line endings consistent all on operating systems.
 * Requires both the boilerplate and newly created files to get passed through this to ensure they are the same
 *
 * @param string filename eg originCWD + "/console/create_app/app.ts" or tmpDir + "/app.ts"
 */
function getFileContent(filePathAndName: string): string {
  const fullFilepath = `${originalCWD}/${filePathAndName}`;
  const fileContent = decoder.decode(
    Deno.readFileSync(fullFilepath),
  ).replace(/\r\n/g, "\n");
  return fileContent;
}

/**
 * Fetch contents from the URL provided.
 *
 * @param url
 *
 * Returns the contents of the fetched URL.
 */
async function fetchFileContent(url: string): Promise<string> {
  const response = await fetch(drashUrl + url);
  return await response.text();
}

const fileExists = async (filename: string): Promise<boolean> => {
  const fullFilepath = originalCWD + "/" + filename;
  try {
    await Deno.stat(fullFilepath);
    // successful, file or directory must exist
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // file or directory does not exist
      return false;
    } else {
      // unexpected error, maybe permissions, pass it along
      throw error;
    }
  }
};

Rhum.testPlan("create_app_test_http.ts", () => {
  Rhum.testSuite("(no arguments passed in)", () => {
    Rhum.testCase("script fails with no argument", async () => {
      const p = Deno.run({
        cmd: [
          "deno",
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-run",
          drashUrl + "/create_app.ts",
        ],
        stdout: "piped",
        stderr: "piped",
      });
      const status = await p.status();
      p.close();
      const stdout = new TextDecoder("utf-8").decode(await p.output());
      const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
      Rhum.asserts.assert(
        stderr.includes(
          "Too few options were given. Use the --help option for more information.",
        ),
      );
      Rhum.asserts.assertEquals(stdout, "");
      Rhum.asserts.assertEquals(status.code, 1);
      Rhum.asserts.assertEquals(status.success, false);
    });
  });

  Rhum.testSuite("--help", () => {
    Rhum.testCase("Script success with the --help argument", async () => {
      const p = Deno.run({
        cmd: [
          "deno",
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-run",
          `${drashUrl}/create_app.ts`,
          "--help",
        ],
        stdout: "piped",
        stderr: "piped",
      });
      const status = await p.status();
      p.close();
      const stdout = new TextDecoder("utf-8").decode(await p.output());
      const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
      Rhum.asserts.assertEquals(stderr, "");
      Rhum.asserts.assertEquals(
        stdout,
        "\n" +
          "A create app script for Drash\n" +
          "\n" +
          "USAGE:\n" +
          "    deno run --allow-read --allow-run [--allow-write --allow-net] create_app.ts [OPTIONS]\n" +
          "    deno run --allow-read --allow-run [--allow-write --allow-net] https://deno.land/x/drash/create_app.ts [OPTIONS]\n" +
          "\n" +
          "OPTIONS:\n" +
          "The --api and --web-app options cannot be used together.\n" +
          "\n" +
          "    --api\n" +
          "        Creates the file structure and content for a Drash API.\n" +
          "\n" +
          "    --web-app\n" +
          "        Creates the file structure and content for a Drash Web App.\n" +
          "\n" +
          "    --web-app --with-vue\n" +
          "        Creates the file structure and content for a Drash Web App.\n" +
          "        This options requires Node and npm because it uses Vue and webpack.\n" +
          "\n" +
          "EXAMPLE USAGE:\n" +
          "    mkdir my-drash-api\n" +
          "    cd my-drash-api\n" +
          "    deno run --allow-read --allow-run --allow-write --allow-net https://deno.land/x/drash/create_app.ts --api\n" +
          "\n",
      );
      Rhum.asserts.assertEquals(status.code, 0);
      Rhum.asserts.assert(status.success);
    });
  });

  /**
   *  API tests
   * 
   *   - app_api.ts -> app.ts
   *   - server_api.ts -> server.ts
   *   - config.ts 
   *   - deps.ts 
   *   - resources/home_resource_api.ts -> resources/home_resources.ts
   *   - tests/resources/home_resource_test_api.ts -> tests/resources/home_resource_test.ts
   * 
   */

  Rhum.testSuite("--api", () => {
    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);
    let boilerPlateFile: string;
    let copiedFile: string;
    const bpPrefix = "/console/create_app";

    Rhum.testCase(
      "creates an API project",
      async () => {
        // Create new tmp directory and create project files
        Deno.mkdirSync(testCaseTmpDirName);
        const p = Deno.run({
          cmd: [
            "deno",
            "run",
            "--allow-read",
            "--allow-write",
            "--allow-net",
            "--allow-run",
            `${drashUrl}/create_app.ts`,
            "--api",
          ],
          stdout: "piped",
          stderr: "piped",
          cwd: testCaseTmpDirName,
        });
        const status = await p.status();
        p.close();
        const stdout = new TextDecoder("utf-8").decode(await p.output());
        const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
        Rhum.asserts.assertEquals(status.code, 0);
        Rhum.asserts.assert(status.success);
      },
    );

    Rhum.testCase("correctly creates app.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/app.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/app_api.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/app.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates server.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/server.ts`),
      );

      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/server_api.ts`,
      );

      copiedFile = getFileContent(`${testCaseTmpDirName}/server.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates deps.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/deps.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/deps.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/deps.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates config.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/config.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/config.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/config.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates resources/home_resource.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/resources/home_resource.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/resources/home_resource_api.ts`,
      );
      copiedFile = getFileContent(
        `${testCaseTmpDirName}/resources/home_resource.ts`,
      );
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase(
      "correctly creates tests/resources/home_resource_test.ts",
      async () => {
        Rhum.asserts.assert(
          await fileExists(
            `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
          ),
        );
        boilerPlateFile = await fetchFileContent(
          `${bpPrefix}/tests/resources/home_resource_test_api.ts`,
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      },
    );
  });

  /**
   *  Web app tests
   * 
   *   - app_web_app.ts -> app.ts 
   *   - server_web_app.ts -> server.ts
   *   - deps.ts
   *   - config.ts 
   *   - resources/home_resource_web_app.ts -> resources/home_resources.ts
   *   - tests/resources/home_resource_test_web_app.ts -> tests/resources/home_resource_test.ts 
   *   - public/js/index.js  
   *   - public/views/index.html 
   *   - public/css/index.css  
   *   - public/img
   * 
   */

  Rhum.testSuite("--web-app", () => {
    let copiedFile: string;
    let boilerPlateFile: string;
    let bpPrefix = "/console/create_app";
    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);

    Rhum.testCase(
      "creates a web app",
      async () => {
        // Create new tmp directory and create project files
        Deno.mkdirSync(testCaseTmpDirName);
        const p = Deno.run({
          cmd: [
            "deno",
            "run",
            "--allow-read",
            "--allow-write",
            "--allow-net",
            "--allow-run",
            `${drashUrl}/create_app.ts`,
            "--web-app",
          ],
          stdout: "piped",
          stderr: "piped",
          cwd: testCaseTmpDirName,
        });
        const status = await p.status();
        p.close();
        const stdout = new TextDecoder("utf-8").decode(await p.output());
        const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
        Rhum.asserts.assertEquals(stderr, "");
        Rhum.asserts.assertEquals(status.code, 0);
        Rhum.asserts.assert(status.success);
      },
    );

    Rhum.testCase("correctly creates app.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/app.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/app_web_app.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/app.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates server.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/server.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/server_web_app.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/server.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates deps.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/deps.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/deps.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/deps.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates config.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/config.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/config.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/config.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates resources/home_resource.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/resources/home_resource.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/resources/home_resource_web_app.ts`,
      );
      copiedFile = getFileContent(
        `${testCaseTmpDirName}/resources/home_resource.ts`,
      );
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase(
      "correctly creates tests/resources/home_resource_test.ts",
      async () => {
        Rhum.asserts.assert(
          await fileExists(
            `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
          ),
        );
        boilerPlateFile = await fetchFileContent(
          `${bpPrefix}/tests/resources/home_resource_test_web_app.ts`,
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      },
    );

    Rhum.testCase("correctly creates public/js/index.js", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/public/js/index.js`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/public/js/index.js`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/public/js/index.js`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates public/css/index.css", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/public/css/index.css`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/public/css/index.css`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/public/css/index.css`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates public/views/index.html", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/public/views/index.html`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/public/views/index.html`,
      );
      copiedFile = getFileContent(
        `${testCaseTmpDirName}/public/views/index.html`,
      );
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("creates public/img dir", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/public/img`),
      );
    });
  });

  /**
   * Web app with Vue tests
   *  - app_web_app.ts -> app.ts
   *  - server_web_app.ts -> server.ts
   *  - deps.ts
   *  - config.ts
   *  - resources/home_resource_web_app.ts -> resources/home_resource.ts
   *  - tests/resources/home_resource_test_web_app.ts -> tests/resources/home_resource.ts
   *  - public/img
   *  - webpack_vue.config.json -> webpack.config.json
   *  - package_vue.json -> package.json
   *  - Vue/app.vue -> Vue/App.vue
   *  - Vue/app.js
   */
  Rhum.testSuite("--web-app --with-vue", () => {
    let boilerPlateFile: string;
    let copiedFile: string;
    let bpPrefix = "/console/create_app"; // boilerplate prefix
    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);

    Rhum.testCase("creates a web app with Vue", async () => {
      // Create new tmp directory and create project files
      Deno.mkdirSync(testCaseTmpDirName);
      let p = Deno.run({
        cmd: [
          "deno",
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-net",
          "--allow-run",
          `${drashUrl}/create_app.ts`,
          "--web-app",
          "--with-vue",
        ],
        stdout: "piped",
        stderr: "piped",
        cwd: testCaseTmpDirName,
      });
      const status = await p.status();
      p.close();
      const stdout = new TextDecoder("utf-8").decode(await p.output());
      const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
      Rhum.asserts.assertEquals(stderr, "");
      Rhum.asserts.assertEquals(status.code, 0);
      Rhum.asserts.assert(status.success);
    });

    Rhum.testCase("correctly creates app.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/app.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/app_web_app.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/app.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates server.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/server.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/server_web_app.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/server.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates deps.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/deps.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/deps.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/deps.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates config.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/config.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/config.ts`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/config.ts`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates resources/home_resource.ts", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/resources/home_resource.ts`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/resources/home_resource_web_app.ts`,
      );
      copiedFile = getFileContent(
        `${testCaseTmpDirName}/resources/home_resource.ts`,
      );
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase(
      "correctly creates tests/resources/home_resource.ts",
      async () => {
        Rhum.asserts.assert(
          await fileExists(
            `${testCaseTmpDirName}/tests/resources/home_resource.ts`,
          ),
        );
        boilerPlateFile = await fetchFileContent(
          `${bpPrefix}/tests/resources/home_resource_web_app.ts`,
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/tests/resources/home_resource.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      },
    );

    Rhum.testCase("creates public/img directory", async () => {
      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + `/public/img`),
      );
    });

    Rhum.testCase("correctly creates webpack.config.js", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/webpack.config.js`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/webpack_vue.config.js`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/webpack.config.js`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates package.json", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/package.json`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/package_vue.json`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/package.json`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates template file vue/App.vue", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/vue`),
      );
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/vue/App.vue`),
      );

      boilerPlateFile = await fetchFileContent(
        "/console/create_app/vue/app.vue",
      );

      copiedFile = getFileContent(`${testCaseTmpDirName}/vue/App.vue`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    Rhum.testCase("correctly creates vue/app.js", async () => {
      Rhum.asserts.assert(
        await fileExists(`${testCaseTmpDirName}/vue/app.js`),
      );
      boilerPlateFile = await fetchFileContent(
        `${bpPrefix}/vue/app.js`,
      );
      copiedFile = getFileContent(`${testCaseTmpDirName}/vue/app.js`);
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });
  });

  /**
   * Trying to create an API that is a web app should fail
   */
  Rhum.testSuite("--api and --web-app", () => {
    Rhum.testCase(
      "fails if --api and --web-app are specified",
      async () => {
        const p = Deno.run({
          cmd: [
            "deno",
            "run",
            "--allow-read",
            "--allow-write",
            "--allow-run",
            `${drashUrl}/create_app.ts`,
            "--api",
            "--web-app",
          ],
          stdout: "piped",
          stderr: "piped",
        });
        const status = await p.status();
        p.close();
        const stdout = new TextDecoder("utf-8").decode(await p.output());
        const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
        Rhum.asserts.assertEquals(
          stderr,
          red(
            "--web-app and --api options are not allowed to be used together. Use the --help option for more information.",
          ) + "\n",
        );
        Rhum.asserts.assertEquals(stdout, "");
        Rhum.asserts.assertEquals(status.code, 1);
        Rhum.asserts.assertEquals(status.success, false);
      },
    );
  });
});

Rhum.run();
