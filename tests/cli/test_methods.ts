/**
 * Test needs the following flags: --allow-read --allow-run --allow-write
 *
 * Will make a tmp directory in the root of this project, cd into it and create files there.
 * This is only for some tests
 */

// todo add tests that run the app and npm build scripts

import { Rhum } from "../deps.ts";
import { red } from "../../deps.ts";

const originalCWD = Deno.cwd();
const boilerPlatePrefix = "/console/create_app";
const decoder = new TextDecoder("utf-8");

/**
 * To keep line endings consistent all on operating systems.
 * Requires both the boilerplate and newly created files to get passed through this to ensure they are the same
 *
 * @param filePathAndName - eg originCWD + "/console/create_app/app.ts" or tmpDir + "/app.ts", or "tmp/app.ts"
 */
async function getFileContent(filePathAndName: string): Promise<string> {
  const fileContent = decoder.decode(
    Deno.readFileSync(filePathAndName),
  ).replace(/\r\n/g, "\n");
  return fileContent;
}

function runCreateAppScript(
  createAppLocation: string,
  createAppArgs: string[],
): Deno.Process {
  const command = [
    "deno",
    "run",
    "-A",
    createAppLocation,
  ];
  if (createAppArgs.length) {
    createAppArgs.forEach((arg) => {
      command.push(arg);
    });
  }
  console.log("COMMAND FOR RUN PROCESS:");
  console.log(command.join(" "));
  const p = Deno.run({
    cmd: command,
    stdout: "piped",
    stderr: "piped",
    cwd: "tmp",
  });
  return p;
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

export function testMethods(suffix: "local" | "http", url?: string) {
  const baseUrl = url ? url : "..";
  const createAppLocation = baseUrl + "/create_app.ts";

  Rhum.testPlan("create_app_test_" + suffix + ".ts", () => {
    let boilerPlateFile: string;
    let copiedFile: string;

    Rhum.testSuite("(no arguments passed in)", () => {
      Rhum.beforeAll(() => {
        Deno.mkdirSync("tmp");
      });

      Rhum.afterAll(() => {
        Deno.removeSync("tmp");
      });

      Rhum.testCase("fails with no argument", async () => {
        const p = runCreateAppScript(createAppLocation, []);
        const status = await p.status();
        p.close();
        const stdout = new TextDecoder("utf-8").decode(await p.output());
        const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
        Rhum.asserts.assertEquals(
          stderr.indexOf(red(
            "Too few options were given. Use the --help option for more information.",
          ) + "\n") > -1, true
        );
        Rhum.asserts.assertEquals(stdout, "");
        Rhum.asserts.assertEquals(status.code, 1);
        Rhum.asserts.assertEquals(status.success, false);
      });
    });

    Rhum.testSuite("--help", () => {
      Rhum.beforeAll(() => {
        Deno.mkdirSync("tmp");
      });

      Rhum.afterAll(() => {
        Deno.removeSync("tmp");
      });

      Rhum.testCase("displays help", async () => {
        const p = runCreateAppScript(createAppLocation, ["--help"]);
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
      Rhum.testCase(
        "creates an API project",
        async () => {
          Deno.mkdirSync("tmp");
          const p = runCreateAppScript(createAppLocation, ["--api"]);
          const status = await p.status();
          p.close();
          const stdout = new TextDecoder("utf-8").decode(await p.output());
          const stderr = new TextDecoder("utf-8").decode(
            await p.stderrOutput(),
          );
          Rhum.asserts.assertEquals(status.code, 0);
          Rhum.asserts.assert(status.success);
          // TODO :: Assert stdout and stderr
        },
      );

      Rhum.testCase("correctly creates app.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/app.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/app_api.ts`,
        );
        copiedFile = await getFileContent(`tmp/app.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates server.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/server.ts`),
        );

        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/server_api.ts`,
        );

        copiedFile = await getFileContent(`tmp/server.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates deps.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/deps.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/deps.ts`,
        );
        copiedFile = await getFileContent(`tmp/deps.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates config.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/config.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/config.ts`,
        );
        copiedFile = await getFileContent(`tmp/config.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase(
        "correctly creates resources/home_resource.ts",
        async () => {
          Rhum.asserts.assert(
            await fileExists(`tmp/resources/home_resource.ts`),
          );
          boilerPlateFile = await getFileContent(
            originalCWD + `${boilerPlatePrefix}/resources/home_resource_api.ts`,
          );
          copiedFile = await getFileContent(
            `tmp/resources/home_resource.ts`,
          );
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );

      Rhum.testCase(
        "correctly creates tests/resources/home_resource_test.ts",
        async () => {
          Rhum.asserts.assert(
            await fileExists(
              `tmp/tests/resources/home_resource_test.ts`,
            ),
          );
          boilerPlateFile = await getFileContent(
            originalCWD +
              `${boilerPlatePrefix}/tests/resources/home_resource_test_api.ts`,
          );
          copiedFile = await getFileContent(
            `tmp/tests/resources/home_resource_test.ts`,
          );
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
          Deno.removeSync("tmp", { recursive: true });
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
      const bpPrefix = "/console/create_app";

      Rhum.testCase(
        "creates a web app",
        async () => {
          Deno.mkdirSync("tmp");
          // Create new tmp directory and create project files
          const p = runCreateAppScript(createAppLocation, ["--web-app"]);
          const status = await p.status();
          p.close();
          const stdout = new TextDecoder("utf-8").decode(await p.output());
          const stderr = new TextDecoder("utf-8").decode(
            await p.stderrOutput(),
          );
          Rhum.asserts.assertEquals(stderr, "");
          Rhum.asserts.assertEquals(status.code, 0);
          Rhum.asserts.assert(status.success);
          // TODO :: ASSERT STDOUT
        },
      );

      Rhum.testCase("correctly creates app.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/app.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/app_web_app.ts`,
        );
        copiedFile = await getFileContent(`tmp/app.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates server.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/server.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/server_web_app.ts`,
        );
        copiedFile = await getFileContent(`tmp/server.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates deps.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/deps.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/deps.ts`,
        );
        copiedFile = await getFileContent(`tmp/deps.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates config.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/config.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/config.ts`,
        );
        copiedFile = await getFileContent(`tmp/config.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase(
        "correctly creates resources/home_resource.ts",
        async () => {
          Rhum.asserts.assert(
            await fileExists(`tmp/resources/home_resource.ts`),
          );
          boilerPlateFile = await getFileContent(
            originalCWD +
              `${boilerPlatePrefix}/resources/home_resource_web_app.ts`,
          );
          copiedFile = await getFileContent(
            `tmp/resources/home_resource.ts`,
          );
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );

      Rhum.testCase(
        "correctly creates tests/resources/home_resource_test.ts",
        async () => {
          Rhum.asserts.assert(
            await fileExists(
              `tmp/tests/resources/home_resource_test.ts`,
            ),
          );
          boilerPlateFile = await getFileContent(
            originalCWD +
              `${boilerPlatePrefix}/tests/resources/home_resource_test_web_app.ts`,
          );
          copiedFile = await getFileContent(
            `tmp/tests/resources/home_resource_test.ts`,
          );
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );

      Rhum.testCase("correctly creates public/js/index.js", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/public/js/index.js`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/public/js/index.js`,
        );
        copiedFile = await getFileContent(`tmp/public/js/index.js`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates public/css/index.css", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/public/css/index.css`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/public/css/index.css`,
        );
        copiedFile = await getFileContent(`tmp/public/css/index.css`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates public/views/index.html", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/public/views/index.html`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/public/views/index.html`,
        );
        copiedFile = await getFileContent(
          `tmp/public/views/index.html`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("creates public/img dir", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/public/img`),
        );
        Deno.removeSync("tmp", { recursive: true });
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
      Rhum.testCase("creates a web app with Vue", async () => {
        // Create new tmp directory and create project files
        Deno.mkdirSync("tmp");
        const p = runCreateAppScript(
          createAppLocation,
          ["--web-app", "--with-vue"],
        );
        const status = await p.status();
        p.close();
        const stdout = new TextDecoder("utf-8").decode(await p.output());
        const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
        Rhum.asserts.assertEquals(stderr, "");
        Rhum.asserts.assertEquals(status.code, 0);
        Rhum.asserts.assert(status.success);
        // TODO :: ASSERT STDOUT
      });

      Rhum.testCase("correctly creates app.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/app.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/app_web_app.ts`,
        );
        copiedFile = await getFileContent(`tmp/app.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates server.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/server.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/server_web_app.ts`,
        );
        copiedFile = await getFileContent(`tmp/server.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates deps.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/deps.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/deps.ts`,
        );
        copiedFile = await getFileContent(`tmp/deps.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates config.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/config.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/config.ts`,
        );
        copiedFile = await getFileContent(`tmp/config.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase(
        "correctly creates resources/home_resource.ts",
        async () => {
          Rhum.asserts.assert(
            await fileExists(`tmp/resources/home_resource.ts`),
          );
          boilerPlateFile = await getFileContent(
            originalCWD +
              `${boilerPlatePrefix}/resources/home_resource_web_app.ts`,
          );
          copiedFile = await getFileContent(
            `tmp/resources/home_resource.ts`,
          );
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );

      Rhum.testCase("creates public/img directory", async () => {
        Rhum.asserts.assert(
          await fileExists("tmp/public/img"),
        );
      });

      Rhum.testCase("correctly creates webpack.config.js", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/webpack.config.js`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/webpack_vue.config.js`,
        );
        copiedFile = await getFileContent(`tmp/webpack.config.js`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates package.json", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/package.json`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/package_vue.json`,
        );
        copiedFile = await getFileContent(`tmp/package.json`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates template file vue/App.vue", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/vue`),
        );
        Rhum.asserts.assert(
          await fileExists(`tmp/vue/App.vue`),
        );

        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/vue/app.vue`,
        );

        copiedFile = await getFileContent(`tmp/vue/App.vue`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates vue/app.js", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/vue/app.js`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/vue/app.js`,
        );
        copiedFile = await getFileContent(`tmp/vue/app.js`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        Deno.removeSync("tmp", { recursive: true });
      });
    });

    /**
     * Web app with React tests
     *  - app_web_app.ts -> app.ts
     *  - server_web_app.ts -> server.ts
     *  - deps.ts
     *  - config.ts
     *  - resources/home_resource_web_app.ts -> resources/home_resource.ts
     *  - tests/resources/home_resource_test_web_app.ts -> tests/resources/home_resource.ts
     *  - public/img
     *  - webpack_react.config.json -> webpack.config.json
     *  - package_react.json -> package.json
     *  - React/app.react -> Vue/App.react
     *  - React/app.js
     */
    Rhum.testSuite("--web-app --with-react", () => {
      Rhum.testCase("creates a web app with React", async () => {
        // Create new tmp directory and create project files
        Deno.mkdirSync("tmp");
        const p = runCreateAppScript(
          createAppLocation,
          ["--web-app", "--with-react"],
        );
        const status = await p.status();
        p.close();
        const stdout = new TextDecoder("utf-8").decode(await p.output());
        const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
        Rhum.asserts.assertEquals(stderr, "");
        Rhum.asserts.assertEquals(status.code, 0);
        Rhum.asserts.assert(status.success);
        // TODO ASSERT STDOUT
      });

      Rhum.testCase("correctly creates app.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/app.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/app_web_app.ts`,
        );
        copiedFile = await getFileContent(`tmp/app.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates server.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/server.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/server_web_app.ts`,
        );
        copiedFile = await getFileContent(`tmp/server.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates deps.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/deps.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/deps.ts`,
        );
        copiedFile = await getFileContent(`tmp/deps.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates config.ts", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/config.ts`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/config.ts`,
        );
        copiedFile = await getFileContent(`tmp/config.ts`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase(
        "correctly creates resources/home_resource.ts",
        async () => {
          Rhum.asserts.assert(
            await fileExists(`tmp/resources/home_resource.ts`),
          );
          boilerPlateFile = await getFileContent(
            originalCWD +
              `${boilerPlatePrefix}/resources/home_resource_web_app.ts`,
          );
          copiedFile = await getFileContent(
            `tmp/resources/home_resource.ts`,
          );
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );

      Rhum.testCase("creates public/img directory", async () => {
        Rhum.asserts.assert(
          await fileExists("tmp/public/img"),
        );
      });

      Rhum.testCase("correctly creates webpack.config.js", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/webpack.config.js`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/webpack_react.config.js`,
        );
        copiedFile = await getFileContent(`tmp/webpack.config.js`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates package.json", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/package.json`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/package_react.json`,
        );
        copiedFile = await getFileContent(`tmp/package.json`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase(
        "correctly creates template file react/App.tsx",
        async () => {
          Rhum.asserts.assert(
            await fileExists(`tmp/react`),
          );
          Rhum.asserts.assert(
            await fileExists(`tmp/react/App.tsx`),
          );

          boilerPlateFile = await getFileContent(
            originalCWD + `${boilerPlatePrefix}/react/app.tsx`,
          );

          copiedFile = await getFileContent(`tmp/react/App.tsx`);
          Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        },
      );

      Rhum.testCase("correctly creates tsconfig.json", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/tsconfig.json`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/tsconfig_react.json`,
        );
        copiedFile = await getFileContent(`tmp/tsconfig.json`);
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
      });

      Rhum.testCase("correctly creates public/views/index.html", async () => {
        Rhum.asserts.assert(
          await fileExists(`tmp/public/views/index.html`),
        );
        boilerPlateFile = await getFileContent(
          originalCWD + `${boilerPlatePrefix}/public/views/index_react.html`,
        );
        copiedFile = await getFileContent(
          `tmp/public/views/index.html`,
        );
        Rhum.asserts.assertEquals(boilerPlateFile, copiedFile);
        Deno.removeSync("tmp", { recursive: true });
      });
    });

    Rhum.testSuite("--api and --web-app", () => {
      Rhum.testCase(
        "fails if --api and --web-app are specified",
        async () => {
          Deno.mkdirSync("tmp");
          const p = runCreateAppScript(
            createAppLocation,
            ["--api", "--web-app"],
          );
          const status = await p.status();
          p.close();
          const stdout = new TextDecoder("utf-8").decode(await p.output());
          const stderr = new TextDecoder("utf-8").decode(
            await p.stderrOutput(),
          );
          Rhum.asserts.assertEquals(
            stderr,
            red(
              "--web-app and --api options are not allowed to be used together. Use the --help option for more information.",
            ) + "\n",
          );
          Rhum.asserts.assertEquals(stdout, "");
          Rhum.asserts.assertEquals(status.code, 1);
          Rhum.asserts.assertEquals(status.success, false);
          Deno.removeSync("tmp");
        },
      );
    });
  });

  Rhum.run();
}
