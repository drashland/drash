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
let latestBranch = Deno.env.get("GITHUB_HEAD_REF");
let githubRepo = Deno.env.get("GITHUB_REPOSITORY");

if (!latestBranch) {
  latestBranch = "master";
}

if (!githubRepo) {
  githubRepo = "drashland/deno-drash";
}

const drashUrl =
  `https://raw.githubusercontent.com/${githubRepo}/${latestBranch}`;

function getOsCwd() {
  let cwd = `//${originalCWD}/console/create_app`;
  if (Deno.build.os === "windows") {
    cwd = `${originalCWD}\console\create_app`;
  }
  return cwd;
}

function getOsTmpDirName() {
  let tmp = `${originalCWD}/${tmpDirName}`;
  if (Deno.build.os === "windows") {
    tmp = `${originalCWD}\${tmpDirName}`;
  }
  return tmp;
}

/**
 * To keep line endings consistent all on operating systems.
 * Requires both the boilerplate and newly created files to get passed through this to ensure they are the same
 *
 * @param string filename eg originCWD + "/console/create_app/app.ts" or tmpDir + "/app.ts"
 */
function getFileContent(filePathAndName: string): string {
  const fullFilepath = originalCWD + "/" + filePathAndName;
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

// Need a way to check if a file exists
// Thanks to https://stackoverflow.com/questions/56658114/how-can-one-check-if-a-file-or-directory-exists-using-deno
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

Rhum.testPlan("create_app_test.ts", () => {
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
      Rhum.asserts.assertEquals(
        stderr.includes(
          "Too few options were given. Use the --help option for more information.",
        ),
        true,
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
          drashUrl + "/create_app.ts",
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
      Rhum.asserts.assertEquals(status.success, true);
    });
  });

  Rhum.testSuite("--api", () => {
    Rhum.testCase(
      "Script creates an API project with the --api argument",
      async () => {
        const testCaseTmpDirName = tmpDirName + (tmpDirNameCount += 1);
        // Create new tmp directory and create project files
        console.log(`${testCaseTmpDirName}`);
        Deno.mkdirSync(testCaseTmpDirName);
        const p = Deno.run({
          cmd: [
            "deno",
            "run",
            "--allow-read",
            "--allow-write",
            "--allow-net",
            "--allow-run",
            drashUrl + "/create_app.ts",
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
        Rhum.asserts.assertEquals(status.success, true);
        // assert each file and it's content are correct
        let boilerPlateFile;
        let copiedFile;
        // app.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/app.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/app_api.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/app.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // deps.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/deps.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/deps.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/deps.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // config.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/config.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/config.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/config.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/resources/home_resource.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/resources/home_resource_api.ts",
        );
        copiedFile = getFileContent(
          testCaseTmpDirName + "/resources/home_resource.ts",
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource_test.ts
        Rhum.asserts.assertEquals(
          await fileExists(
            testCaseTmpDirName + "/tests/resources/home_resource_test.ts",
          ),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/tests/resources/home_resource_test.ts",
        );
        copiedFile = getFileContent(
          testCaseTmpDirName + "/tests/resources/home_resource_test.ts",
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      },
    );
  });

  Rhum.testSuite("--web-app", () => {
    Rhum.testCase(
      "Script creates a web app with the --web-app argument",
      async () => {
        const testCaseTmpDirName = tmpDirName + (tmpDirNameCount += 1);
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
            drashUrl + "/create_app.ts",
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
        Rhum.asserts.assertEquals(status.success, true);
        // assert each file and it's content are correct
        let boilerPlateFile;
        let copiedFile;
        // app.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/app.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/app_web_app.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/app.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // deps.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/deps.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/deps.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/deps.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // config.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/config.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/config.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/config.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/resources/home_resource.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/resources/home_resource.ts",
        );
        copiedFile = getFileContent(
          testCaseTmpDirName + "/resources/home_resource.ts",
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource_test.ts
        Rhum.asserts.assertEquals(
          await fileExists(
            testCaseTmpDirName + "/tests/resources/home_resource_test.ts",
          ),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/tests/resources/home_resource_test.ts",
        );
        copiedFile = getFileContent(
          testCaseTmpDirName + "/tests/resources/home_resource_test.ts",
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/views/js/index.js
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/public/js/index.js"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/public/js/index.js",
        ),
          copiedFile = getFileContent(
            testCaseTmpDirName + "/public/js/index.js",
          );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/css/index.css.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/public/css/index.css"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/public/css/index.css",
        ),
          copiedFile = getFileContent(
            testCaseTmpDirName + "/public/css/index.css",
          );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/views/index.html.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/public/views/index.html"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/public/views/index.html",
        );
        copiedFile = getFileContent(
          testCaseTmpDirName + "/public/views/index.html",
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/img.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/public/img"),
          true,
        );
      },
    );
  });

  Rhum.testSuite("--web-app --with-vue", () => {
    Rhum.testCase(
      "Script creates a web app with vue with the --web-app and --with-vue arguments",
      async () => {
        const testCaseTmpDirName = tmpDirName + (tmpDirNameCount += 1);
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
            drashUrl + "/create_app.ts",
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
        Rhum.asserts.assertEquals(status.success, true);
        // assert each file and it's content are correct
        let boilerPlateFile;
        let copiedFile;
        // app.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/app.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/app_web_app.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/app.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // deps.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/deps.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/deps.ts",
        ), copiedFile = getFileContent(testCaseTmpDirName + "/deps.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // config.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/config.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/config.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/config.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/resources/home_resource.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/resources/home_resource.ts",
        );
        copiedFile = getFileContent(
          testCaseTmpDirName + "/resources/home_resource.ts",
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource_test.ts
        Rhum.asserts.assertEquals(
          await fileExists(
            testCaseTmpDirName + "/tests/resources/home_resource_test.ts",
          ),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/tests/resources/home_resource_test.ts",
        );
        copiedFile = getFileContent(
          testCaseTmpDirName + "/tests/resources/home_resource_test.ts",
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/img.ts
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/public/img"),
          true,
        );
        // webpack.config.js
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/webpack.config.js"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/webpack_vue.config.js",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/webpack.config.js");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // package.json
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/package.json"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/package_vue.json",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/package.json");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // vue/App.vue
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/vue"),
          true,
        );
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/vue/App.vue"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/vue/app.vue",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/vue/App.vue");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // vue/app.js
        Rhum.asserts.assertEquals(
          await fileExists(testCaseTmpDirName + "/vue/app.js"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/vue/app.js",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/vue/app.js");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      },
    );
  });

  Rhum.testSuite("--api and --web-app", () => {
    Rhum.testCase(
      "Script fails if --api and --web-app are specified",
      async () => {
        const p = Deno.run({
          cmd: [
            "deno",
            "run",
            "--allow-read",
            "--allow-write",
            "--allow-run",
            drashUrl + "/create_app.ts",
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
