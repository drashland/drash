/**
 * Test needs the following flags: --allow-read --allow-run --allow-write
 *
 * Will make a tmp directory in the root of this project, cd into it and create files there.
 * This is only for some tests
 */

import { Rhum } from "../deps.ts";
import { green, red } from "../../deps.ts";
import members from "../members.ts";

const tmpDirName = "tmp-dir-for-testing-create-app";
let tmpDirNameCount = 0;
const originalCWD = Deno.cwd();
const decoder = new TextDecoder("utf-8");

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
  const fileContent = decoder.decode(
    Deno.readFileSync(filePathAndName),
  ).replace(/\r\n/g, "\n");
  return fileContent;
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
Rhum.testPlan("create_app_test_local.ts", () => {
  Rhum.testSuite("(no arguments passed in)", () => {
    Rhum.testCase("fails with no argument", async () => {
      const p = Deno.run({
        cmd: [
          "deno",
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-run",
          "create_app.ts",
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
          "Too few options were given. Use the --help option for more information.",
        ) + "\n",
      );
      Rhum.asserts.assertEquals(stdout, "");
      Rhum.asserts.assertEquals(status.code, 1);
      Rhum.asserts.assertEquals(status.success, false);
    });
  });

  Rhum.testSuite("--help", () => {
    Rhum.testCase("dispays help", async () => {
      const p = Deno.run({
        cmd: [
          "deno",
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-run",
          "create_app.ts",
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
            "../create_app.ts",
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
      },
    );

    for (let [copiedFileName, boilerPlateFileName] of FP_Gen) {
      Rhum.testCase(
        `Correctly creates template file ${copiedFileName.slice(1)}`,
        async () => {
          let copiedFile: string;
          let boilerPlateFile = await getFileContent(
            originalCWD + boilerPlateFileName,
          );

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
    const testCaseTmpDirName = tmpDirName + (tmpDirNameCount += 1);
    let suffixDict = {
      "": [
        "deps.ts",
        "config.ts",
        "public/js/index.js",
        "public/css/index.css",
        "public/views/index.html",
      ],
      "_web_app": [
        "app.ts",
        "server.ts",
        "resources/home_resource.ts",
        "tests/resources/home_resource_test.ts",
      ],
    };
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
            "../create_app.ts",
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
        `Correctly creates template file ${copiedFileName.slice(1)}`,
        async () => {
          let copiedFile: string;
          let boilerPlateFile = await getFileContent(
            originalCWD + boilerPlateFileName,
          );

          Rhum.asserts.assert(
            await fileExists(testCaseTmpDirName + copiedFileName),
          );

          copiedFile = getFileContent(testCaseTmpDirName + copiedFileName);
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );
    }
  });

  Rhum.testSuite("--web-app --with-vue", async () => {
    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);
    let suffixDict = {
      "": ["deps.ts", "config.ts", "vue/app.js"],
      "_web_app": ["app.ts", "server.ts"],
      "_vue": ["webpack.config.js", "package.json"],
    };
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
            "../create_app.ts",
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
      },
    );

    Rhum.testCase("creates public/img directory", async () => {
      // public/img
      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + "/public/img"),
      );
    });

    Rhum.testCase("creates resources/home_resource.ts", async () => {
      // home_resource.ts
      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + "/resources/home_resource.ts"),
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

      let boilerPlateFile = getFileContent(
        originalCWD + "/console/create_app/vue/app.vue",
      );

      let copiedFile = getFileContent(testCaseTmpDirName + "/vue/App.vue");
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    for (let [copiedFileName, boilerPlateFileName] of FP_Gen) {
      Rhum.testCase(
        `correctly creates template file ${copiedFileName.slice(1)}`,
        async () => {
          let copiedFile: string;
          let boilerPlateFile = await getFileContent(
            originalCWD + boilerPlateFileName,
          );

          Rhum.asserts.assert(
            await fileExists(testCaseTmpDirName + copiedFileName),
          );

          copiedFile = getFileContent(testCaseTmpDirName + copiedFileName);
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );
    }
  });

  Rhum.testSuite("--web-app --with-react", () => {
    const testCaseTmpDirName = tmpDirName + (++tmpDirNameCount);
    let suffixDict = {
      "": ["deps.ts", "config.ts"],
      "_web_app": ["app.ts", "server.ts", "resources/home_resource.ts"],
      "_react": [
        "webpack.config.js",
        "package.json",
        "tsconfig.json",
        "public/views/index.html",
      ],
    };

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
            "../create_app.ts",
            "--web-app",
            "--with-react",
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
    // assert each file and it's content are correct
    Rhum.testCase("correctly creates template file App.tsx", async () => {
      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + "/react"),
      );

      Rhum.asserts.assert(
        await fileExists(testCaseTmpDirName + "/react/App.tsx"),
      );

      let boilerPlateFile = getFileContent(
        originalCWD + "/console/create_app/react/app.tsx",
      );
      let copiedFile = getFileContent(testCaseTmpDirName + "/react/App.tsx");
      Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
    });

    for (let [copiedFileName, boilerPlateFileName] of FP_Gen) {
      Rhum.testCase(
        `correctly creates template file ${copiedFileName.slice(1)}`,
        async () => {
          let copiedFile: string;
          let boilerPlateFile = await getFileContent(
            originalCWD + boilerPlateFileName,
          );

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
            "create_app.ts",
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
