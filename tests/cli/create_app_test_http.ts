/**
 * Test needs the following flags: --allow-read --allow-run --allow-write
 *
 * Will make a tmp directory in the root of this project, cd into it and create files there.
 * This is only for some tests
 */

import { Rhum } from "../deps.ts";
import { green, red } from "../../deps.ts";
import { existsSync } from '../../deps.ts';
const tmpDirName = "tmp-dir-for-testing-create-app";
let tmpDirNameCount = 10;
const originalCWD = Deno.cwd();
const decoder = new TextDecoder("utf-8");
const branch = Deno.env.get("GITHUB_HEAD_REF") ?? "master";
const githubOwner = Deno.env.get("GITHUB_ACTOR"); // possible it's the user and not drashland
const repository = "deno-drash";

function add_suffix(fileName: string, suffix: string) {
  return fileName.replace(/([^.\/]+)\./, `\$1${suffix}.`);
}

function* FilePairGenerator(suffixDict: { [suffix: string]: string[] }, rootDirName = ""): Generator<[ string, string ]> {
  const fetchPrefix = "/console/create_app";
  for (const suffix in suffixDict) {
    for (const file of suffixDict[suffix]) {
      yield [ `${rootDirName}/${file}`, `${fetchPrefix}/${add_suffix(file, suffix)}` ];
    }
  }

}

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
        )
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

  Rhum.testSuite("--api", () => {
    let p: Deno.Process;
    let status: Deno.ProcessStatus;
    let stdout: string;
    let stderr: string;

    const suffixDict = { "": [ "deps.ts", "config.ts" ],
                         "_api": [ "app.ts", "server.ts", "resources/home_resource.ts", "tests/resources/home_resource.ts" ] }

    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);
    const FP_Gen: Generator<[string, string]> = FilePairGenerator(suffixDict);

    Rhum.testCase(
      "Script executes successfully",
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
      });

    for (let [ copiedFileName, boilerPlateFileName ] of FP_Gen) {
      Rhum.testCase(`Correctly creates template file ${copiedFileName.slice(1)}`, async () => {
        console.log('copiedFileName: ' + copiedFileName);
        console.log('BoilerPlateFileName: ' + boilerPlateFileName);
        let boilerPlateFile = await fetchFileContent(boilerPlateFileName);
        let copiedFile: string;
        /*
        let slashLoc: number;
        while ((slashLoc = copiedFileName.indexOf("/")) !== -1) {
          Rhum.asserts.assert(
            existsSync(`${testCaseTmpDirName}/${copiedFileName.substr(0, slashLoc)}`)
          );
        }
        */

        console.log('Before assert: ' + testCaseTmpDirName + copiedFileName);
        Rhum.asserts.assert(
          existsSync(testCaseTmpDirName + copiedFileName),
        );

        copiedFile = getFileContent(testCaseTmpDirName + copiedFileName);
        // Rhum.asserts.assertEquals(true, true);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });
    }

    /*
    for (const file of apiFiles) {
      Rhum.testCase(`Correctly creates template file ${file}`, async () => {
        let boilerPlateFile = await fetchFileContent(`${fetchPrefix}/${add_suffix(file, '_api')}`);
        let copiedFile: string;
        let prevSlashLoc = 0, slashLoc;
        while ((slashLoc = file.indexOf("/")) !== -1) {
          Rhum.asserts.assert(
            existsSync(`${testCaseTmpDirName}/${file.substr(prevSlashLoc, slashLoc - 1)}`)
          );
          prevSlashLoc = slashLoc;
        }

        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/${file}`)
        );

        copiedFile = getFileContent(`${testCaseTmpDirName}/${file}`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });
    }
    */
    /*
        let boilerPlateFile;
        let copiedFile;
        // app.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/app.ts`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/app_api.ts",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/app.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // server.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/server.ts`)
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/server_api.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/server.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // deps.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/deps.ts`)
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/deps.ts",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/deps.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // config.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/config.ts`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/config.ts",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/config.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/resources/home_resource.ts`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/resources/home_resource_api.ts",
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/resources/home_resource.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource_test.ts
        Rhum.asserts.assert(
          existsSync(
            `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
          )
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/tests/resources/home_resource_test_api.ts",
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    */
  });

  /*
  Rhum.testSuite("--web-app", () => {
    Rhum.testCase(
      "Script creates a web app with the --web-app argument",
      async () => {
        const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);
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
        // assert each file and it's content are correct
        let boilerPlateFile;
        let copiedFile;
        // app.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/app.ts`)
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/app_web_app.ts",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/app.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // server.ts
        Rhum.asserts.assert(
          await existsSync(`${testCaseTmpDirName}/server.ts`)
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/server_web_app.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/server.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // deps.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/deps.ts`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/deps.ts",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/deps.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // config.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/config.ts`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/config.ts",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/config.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/resources/home_resource.ts`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/resources/home_resource_web_app.ts",
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/resources/home_resource.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource_test.ts
        Rhum.asserts.assert(
          existsSync(
            `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
          ),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/tests/resources/home_resource_test_web_app.ts",
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/views/js/index.js
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/public/js/index.js`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/public/js/index.js",
        ),
          copiedFile = getFileContent(
            `${testCaseTmpDirName}/public/js/index.js`,
          );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/css/index.css.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/public/css/index.css`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/public/css/index.css",
        ),
          copiedFile = getFileContent(
            `${testCaseTmpDirName}/public/css/index.css`,
          );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/views/index.html.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/public/views/index.html`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/public/views/index.html",
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/public/views/index.html`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/img
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/public/img`),
        );
      },
    );
  });

  Rhum.testSuite("--web-app --with-vue", () => {
    let p: Deno.Process;
    let status: Deno.ProcessStatus;
    let fetchPrefix = "/console/create_app";
    const filesList = [ "deps.ts", "server.ts", "config.ts", 
                        "vue/App.vue", "vue/app.js" ];

    let testCaseTmpDirName: string;
    const webAppFiles = [ "app.ts", "server.ts", "resources/home_resource.ts" ];
    const vueConfigFiles = [ "webpack.config.js", "package.json" ];

    Rhum.beforeAll(async () => {
        // Create new tmp directory and create project files
      testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);
      Deno.mkdirSync(testCaseTmpDirName);
      p = Deno.run({
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
      status = await p.status();
      p.close();
    });


    Rhum.testCase(
      "Script runs successfully",
      async () => {
        const stdout = new TextDecoder("utf-8").decode(await p.output());
        const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
        Rhum.asserts.assertEquals(stderr, "");
        Rhum.asserts.assertEquals(status.code, 0);
        Rhum.asserts.assert(status.success);
      }
    );

    for (const file of filesList) {
      Rhum.testCase(`Correctly creates template file ${file}`, async () => {
        let boilerPlateFile = await fetchFileContent(`${fetchPrefix}/${file}`);
        let copiedFile: string;
        let prevSlashLoc = 0, slashLoc;
        while ((slashLoc = file.indexOf("/")) !== -1) {
          Rhum.asserts.assert(
            existsSync(`${testCaseTmpDirName}/${file.substr(prevSlashLoc, slashLoc - 1)}`)
          );
          prevSlashLoc = slashLoc;
        }

        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/${file}`)
        );

        copiedFile = getFileContent(`${testCaseTmpDirName}/${file}`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });
    }

    for (const file of webAppFiles) {
      Rhum.testCase(`Correctly creates template file ${file}`, async () => {
        let boilerPlateFile = await fetchFileContent(`${fetchPrefix}/${add_suffix(file, '_web_app')}`);
        let copiedFile: string;
        let prevSlashLoc = 0, slashLoc;
        while ((slashLoc = file.indexOf("/")) !== -1) {
          Rhum.asserts.assert(
            existsSync(`${testCaseTmpDirName}/${file.substr(prevSlashLoc, slashLoc - 1)}`)
          );
          prevSlashLoc = slashLoc;
        }

        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/${file}`)
        );

        copiedFile = getFileContent(`${testCaseTmpDirName}/${file}`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });
    }

    for (const file of vueConfigFiles) {
      Rhum.testCase(`Correctly creates template file ${file}`, async () => {
        let boilerPlateFile = await fetchFileContent(`${fetchPrefix}/${add_suffix(file, '_vue')}`);
        let copiedFile: string;
        let prevSlashLoc = 0, slashLoc;
        while ((slashLoc = file.indexOf("/")) !== -1) {
          Rhum.asserts.assert(
            existsSync(`${testCaseTmpDirName}/${file.substr(prevSlashLoc, slashLoc - 1)}`)
          );
          prevSlashLoc = slashLoc + 1;
        }

        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/${file}`)
        );

        copiedFile = getFileContent(`${testCaseTmpDirName}/${file}`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });
    }


    /*
    Rhum.testCase(
      "Script creates a web app with vue with the --web-app and --with-vue arguments",
      async () => {
        // Create new tmp directory and create project files
        p.close();
        // assert each file and it's content are correct
        let boilerPlateFile;
        let copiedFile;
        // app.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/app.ts`)
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/app_web_app.ts",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/app.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // server.ts
        Rhum.asserts.assertEquals(
          await existsSync(testCaseTmpDirName + "/server.ts"),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/server_web_app.ts",
        );
        copiedFile = getFileContent(testCaseTmpDirName + "/server.ts");
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // deps.ts
        Rhum.asserts.assertEquals(
          existsSync(`${testCaseTmpDirName}/deps.ts`),
          true,
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/deps.ts",
        ), copiedFile = getFileContent(`${testCaseTmpDirName}/deps.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // config.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/config.ts`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/config.ts",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/config.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // home_resource.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/resources/home_resource.ts`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/resources/home_resource_web_app.ts",
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/resources/home_resource.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/img
        Rhum.asserts.assert(
          existsSync(testCaseTmpDirName + "/public/img")
        );

        // home_resource_test.ts
        Rhum.asserts.assert(
          existsSync(
            `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`
          )
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/tests/resources/home_resource_test.ts",
        );
        copiedFile = getFileContent(
          `${testCaseTmpDirName}/tests/resources/home_resource_test.ts`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // public/img.ts
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/public/img`),
        );
        // webpack.config.js
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/webpack.config.js`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/webpack_vue.config.js",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/webpack.config.js`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // package.json
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/package.json`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/package_vue.json",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/package.json`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // vue/App.vue
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/vue`),
        );
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/vue/App.vue`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/vue/app.vue",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/vue/App.vue`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        // vue/app.js
        Rhum.asserts.assert(
          existsSync(`${testCaseTmpDirName}/vue/app.js`),
        );
        boilerPlateFile = await fetchFileContent(
          "/console/create_app/vue/app.js",
        );
        copiedFile = getFileContent(`${testCaseTmpDirName}/vue/app.js`);
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
*/
});

Rhum.run();

