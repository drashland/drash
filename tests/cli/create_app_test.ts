/**
 * Test needs the following flags: --allow-read --allow-run --allow-write
 *
 * Will make a tmp directory in the root of this project, cd into it and create files there.
 * This is only for some tests
 */

import { red, green } from "../../deps.ts";
import members from "../members.ts";
const tmpDirName = "tmp-dir-for-testing-create-app";
const originalCWD = Deno.cwd();
const decoder = new TextDecoder("utf-8");

// Need a way to check if a file exists
// Thanks to https://stackoverflow.com/questions/56658114/how-can-one-check-if-a-file-or-directory-exists-using-deno
const fileExists = async (filename: string): Promise<boolean> => {
  try {
    await Deno.stat(filename);
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

members.test("create_app_test.ts | Script fails with no argument", async () => {
  const p = await Deno.run({
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
  members.assertEquals(
    stderr,
    red(
      "Too few options were given. Use the --help option for more information.",
    ) + "\n",
  );
  members.assertEquals(stdout, "");
  members.assertEquals(status.code, 1);
  members.assertEquals(status.success, false);
});

members.test("create_app_test.ts | Script success with the --help argument", async () => {
  const p = await Deno.run({
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
  members.assertEquals(stderr, "");
  members.assertEquals(
    stdout,
    "\n" +
      "A create app script for Drash\n" +
      "\n" +
      "USAGE:\n" +
      "    deno run --allow-read --allow-run create_app.ts [OPTIONS]\n" +
      "    deno run --allow-read --allow-run https://deno.land/x/drash/create_app.ts [OPTIONS]\n" +
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
      "    deno run --allow-read --allow-run --allow-write https://deno.land/x/drash/create_app.ts --api\n" +
      "\n",
  );
  members.assertEquals(status.code, 0);
  members.assertEquals(status.success, true);
});

members.test("create_app_test.ts | Script creates an API project with the --api argument", async () => {
  // Create new tmp directory and create project files
  Deno.mkdirSync(tmpDirName);
  Deno.chdir(tmpDirName);
  const p = await Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-run",
      "../create_app.ts",
      "--api",
    ],
    stdout: "piped",
    stderr: "piped",
  });
  const status = await p.status();
  p.close();
  const stdout = new TextDecoder("utf-8").decode(await p.output());
  const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
  members.assertEquals(stderr, "");
  const assertedStdout = `Downloading ${originalCWD}/console/create_app to ${originalCWD}/${tmpDirName}\n` +
    "Creating your API project.\n" +
    "Your Drash API project has been created.\n" +
    "Thank you for using Drash's create app script, we hope you enjoy your newly built project!\n" +
    "To run your application:\n" +
    "    deno run --allow-net --allow-read app.ts\n";
  members.assertEquals(stdout, assertedStdout);
  members.assertEquals(status.code, 0);
  members.assertEquals(status.success, true);
  // assert each file and it's content are correct
  let boilerPlateFile;
  let copiedFile;
  // app.ts
  members.assertEquals(await fileExists("app.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/app_api.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("app.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // deps.ts
  members.assertEquals(await fileExists("deps.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/deps.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("deps.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // config.ts
  members.assertEquals(await fileExists("config.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/config.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("config.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // home_resource.ts
  members.assertEquals(await fileExists("resources/home_resource.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/resources/home_resource_api.ts",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("resources/home_resource.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // home_resource_test.ts
  members.assertEquals(
    await fileExists("tests/resources/home_resource_test.ts"),
    true,
  );
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/tests/resources/home_resource_test.ts",
    ),
  );
  copiedFile = decoder.decode(
    Deno.readFileSync("tests/resources/home_resource_test.ts"),
  );
  members.assertEquals(boilerPlateFile, copiedFile);
  // Remove the created directory
  Deno.chdir(originalCWD);
  Deno.removeSync(tmpDirName, { recursive: true });
});

members.test("create_app_test.ts | Script creates a web app with the --web-app argument", async () => {
  Deno.mkdirSync(tmpDirName);
  Deno.chdir(tmpDirName);
  const p = await Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-run",
      "../create_app.ts",
      "--web-app",
    ],
    stdout: "piped",
    stderr: "piped",
  });
  const status = await p.status();
  p.close();
  const stdout = new TextDecoder("utf-8").decode(await p.output());
  const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
  members.assertEquals(stderr, "");
  members.assertEquals(
    stdout,
    `Downloading ${originalCWD}/console/create_app to ${originalCWD}/${tmpDirName}\n` +
    "Creating your web app project.\n" +
    "Your Drash web app project has been created.\n" +
      "Thank you for using Drash's create app script, we hope you enjoy your newly built project!\n" +
      "To run your application:\n" +
      "    deno run --allow-net --allow-read app.ts\n",
  );
  members.assertEquals(status.code, 0);
  members.assertEquals(status.success, true);
  // assert each file and it's content are correct
  let boilerPlateFile;
  let copiedFile;
  // app.ts
  members.assertEquals(await fileExists("app.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/app_web_app.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("app.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // deps.ts
  members.assertEquals(await fileExists("deps.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/deps.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("deps.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // config.ts
  members.assertEquals(await fileExists("config.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/config.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("config.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // home_resource.ts
  members.assertEquals(await fileExists("resources/home_resource.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/resources/home_resource.ts",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("resources/home_resource.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // home_resource_test.ts
  members.assertEquals(
    await fileExists("tests/resources/home_resource_test.ts"),
    true,
  );
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/tests/resources/home_resource_test.ts",
    ),
  );
  copiedFile = decoder.decode(
    Deno.readFileSync("tests/resources/home_resource_test.ts"),
  );
  members.assertEquals(boilerPlateFile, copiedFile);
  // public/views/js/index.js
  members.assertEquals(await fileExists("public/js/index.js"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/public/js/index.js"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("public/js/index.js"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // public/css/index.css.ts
  members.assertEquals(await fileExists("public/css/index.css"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/public/css/index.css"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("public/css/index.css"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // public/views/index.html.ts
  members.assertEquals(await fileExists("public/views/index.html"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/public/views/index.html",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("public/views/index.html"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // public/img.ts
  members.assertEquals(await fileExists("public/img"), true);
  Deno.chdir(originalCWD);
  Deno.removeSync(tmpDirName, { recursive: true });
});

members.test("create_app_test.ts | Script creates a web app with vue with the --web-app and --with-vue arguments", async () => {
  Deno.mkdirSync(tmpDirName);
  Deno.chdir(tmpDirName);
  const p = await Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-run",
      "../create_app.ts",
      "--web-app",
      "--with-vue",
    ],
    stdout: "piped",
    stderr: "piped",
  });
  const status = await p.status();
  p.close();
  const stdout = new TextDecoder("utf-8").decode(await p.output());
  const stderr = new TextDecoder("utf-8").decode(await p.stderrOutput());
  members.assertEquals(stderr, "");
  members.assertEquals(
    stdout,
    `Downloading ${originalCWD}/console/create_app to ${originalCWD}/${tmpDirName}\n` +
    "Creating your web app project.\n" +
    "Creating Vue files.\n" +
    "Your Drash web app project with Vue has been created.\n" +
      "Thank you for using Drash's create app script, we hope you enjoy your newly built project!\n" +
      "Install NPM dependencies:\n" +
      "    npm install\n" +
      "Build your Vue component with Webpack:\n" +
      "    npm run buildVue\n" +
      "To run your application:\n" +
      "    deno run --allow-net --allow-read app.ts\n",
  );
  members.assertEquals(status.code, 0);
  members.assertEquals(status.success, true);
  // assert each file and it's content are correct
  let boilerPlateFile;
  let copiedFile;
  // app.ts
  members.assertEquals(await fileExists("app.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/app_web_app.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("app.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // deps.ts
  members.assertEquals(await fileExists("deps.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/deps.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("deps.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // config.ts
  members.assertEquals(await fileExists("config.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/config.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("config.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // home_resource.ts
  members.assertEquals(await fileExists("resources/home_resource.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/resources/home_resource.ts",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("resources/home_resource.ts"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // home_resource_test.ts
  members.assertEquals(
    await fileExists("tests/resources/home_resource_test.ts"),
    true,
  );
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/tests/resources/home_resource_test.ts",
    ),
  );
  copiedFile = decoder.decode(
    Deno.readFileSync("tests/resources/home_resource_test.ts"),
  );
  members.assertEquals(boilerPlateFile, copiedFile);
  // public/img.ts
  members.assertEquals(await fileExists("public/img"), true);
  // webpack.config.js
  members.assertEquals(await fileExists("webpack.config.js"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/webpack_vue.config.js",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("webpack.config.js"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // package.json
  members.assertEquals(await fileExists("package.json"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/package_vue.json"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("package.json"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // vue/App.vue
  members.assertEquals(await fileExists("vue"), true);
  members.assertEquals(await fileExists("vue/App.vue"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/vue/app.vue"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("vue/App.vue"));
  members.assertEquals(boilerPlateFile, copiedFile);
  // vue/app.js
  members.assertEquals(await fileExists("vue/app.js"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/vue/app.js"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("vue/app.js"));
  members.assertEquals(boilerPlateFile, copiedFile);

  Deno.chdir(originalCWD);
  Deno.removeSync(tmpDirName, { recursive: true });
});

members.test("create_app_test.ts | Script fails if --api and --web-app are specified", async () => {
  const p = await Deno.run({
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
  members.assertEquals(
    stderr,
    red(
      "--web-app and --api options are now allowed to be used together. Use the --help option for more information.",
    ) + "\n",
  );
  members.assertEquals(stdout, "");
  members.assertEquals(status.code, 1);
  members.assertEquals(status.success, false);
});
