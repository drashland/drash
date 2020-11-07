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

function add_suffix(fileName: string, suffix: string) {
  return fileName.replace(/([^.\/]+)\./, `\$1${suffix}.`);
}

function* FilePairGenerator(
  suffixDict: { [suffix: string]: string[] },
  rootDirName = "",
): Generator<[string, string]> {
  const fetchPrefix = "/console/create_app";
  for (const suffix in suffixDict) {
    for (const file of suffixDict[suffix]) {
      yield [
        `${rootDirName}/${file}`,
        `${fetchPrefix}/${add_suffix(file, suffix)}`,
      ];
    }
  }
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

  Rhum.testSuite("--api", () => {
    const suffixDict = {
      "": ["deps.ts", "config.ts"],
      "_api": [
        "app.ts",
        "server.ts",
        "resources/home_resource.ts",
        "tests/resources/home_resource_test.ts",
      ],
    };

    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);
    const FP_Gen: Generator<[string, string]> = FilePairGenerator(suffixDict);

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

    for (let [copiedFileName, boilerPlateFileName] of FP_Gen) {
      Rhum.testCase(
        `correctly creates template file ${copiedFileName.slice(1)}`,
        async () => {
          let copiedFile: string;
          let boilerPlateFile = await fetchFileContent(boilerPlateFileName);

          Rhum.asserts.assert(
            await fileExists(testCaseTmpDirName + copiedFileName),
          );

          copiedFile = getFileContent(testCaseTmpDirName + copiedFileName);
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );
    }
  });

  Rhum.testSuite("--web-app", () => {
    const suffixDict = {
      "": [
        "deps.ts",
        "config.ts",
        "public/views/index.html",
        "public/js/index.js",
        "public/css/index.css",
      ],
      "_web_app": [
        "app.ts",
        "server.ts",
        "resources/home_resource.ts",
        "tests/resources/home_resources_test.ts",
      ],
    };
    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);
    const FP_Gen: Generator<[string, string]> = FilePairGenerator(suffixDict);

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

    Rhum.testCase("creates public/img dir", async () => {
      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + "/public/img"),
      );
    });

    for (let [copiedFileName, boilerPlateFileName] of FP_Gen) {
      Rhum.testCase(
        `correctly creates template file ${copiedFileName.slice(1)}`,
        async () => {
          let copiedFile: string;
          let boilerPlateFile = await fetchFileContent(boilerPlateFileName);

          Rhum.asserts.assert(
            await fileExists(testCaseTmpDirName + copiedFileName),
          );

          copiedFile = getFileContent(testCaseTmpDirName + copiedFileName);
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );
    }
  });

  Rhum.testSuite("--web-app --with-vue", () => {
    let p: Deno.Process;
    let status: Deno.ProcessStatus;
    const suffixDict = {
      "": [
        "deps.ts",
        "config.ts",
        "vue/app.js",
      ],
      "_web_app": ["app.ts", "server.ts", "resources/home_resource.ts"],
      "_vue": ["webpack.config.js", "package.json"],
    };
    const FP_Gen: Generator<[string, string]> = FilePairGenerator(suffixDict);

    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);

    Rhum.testCase("creates a web app with Vue", async () => {
      // Create new tmp directory and create project files
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
      const stdout = new TextDecoder("utf-8").decode(await p.output());
      const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
      Rhum.asserts.assertEquals(stderr, "");
      Rhum.asserts.assertEquals(status.code, 0);
      Rhum.asserts.assert(status.success);
    });

    Rhum.testCase("creates public/img directory", async () => {
      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + `/public/img`),
      );
    });

    Rhum.testCase("correctly creates template file vue/App.vue", async () => {
      // vue/App.vue
      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + "/vue"),
      );
      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + "/vue/App.vue"),
      );

      let boilerPlateFile = await fetchFileContent(
        "/console/create_app/vue/app.vue",
      );

      let copiedFile = getFileContent(testCaseTmpDirName + "/vue/App.vue");
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    for (let [copiedFileName, boilerPlateFileName] of FP_Gen) {
      Rhum.testCase(
        `correctly creates template file ${copiedFileName.slice(1)}`,
        async () => {
          let copiedFile: string;
          let boilerPlateFile = await fetchFileContent(boilerPlateFileName);

          Rhum.asserts.assert(
            await fileExists(testCaseTmpDirName + copiedFileName),
          );

          copiedFile = getFileContent(testCaseTmpDirName + copiedFileName);
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );
    }
  });

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
