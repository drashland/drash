/**
 * Test needs the following flags: --allow-read --allow-run --allow-write
 *
 * Will make a tmp directory in the root of this project, cd into it and create files there.
 * This is only for some tests
 */

import members from "./members.ts";
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

/**
 * File requires the following flags: --allow-read, --allow-write, --allow-run
 */

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
  });
  const status = await p.status();
  await p.close();
  members.assert.equal(status.code, 1);
  members.assert.equal(status.success, false);
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
  });
  const status = await p.status();
  await p.close();
  members.assert.equal(status.code, 0);
  members.assert.equal(status.success, true);
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
  });
  const status = await p.status();
  await p.close();
  members.assert.equal(status.code, 0);
  members.assert.equal(status.success, true);
  // assert each file and it's content are correct
  let boilerPlateFile;
  let copiedFile;
  // app.ts
  members.assert.equal(await fileExists("app.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/app_api.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("app.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // deps.ts
  members.assert.equal(await fileExists("deps.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/deps.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("deps.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // config.ts
  members.assert.equal(await fileExists("config.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/config.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("config.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // home_resource.ts
  members.assert.equal(await fileExists("resources/home_resource.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/resources/home_resource_api.ts",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("resources/home_resource.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // home_resource_test.ts
  members.assert.equal(
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
  members.assert.equal(boilerPlateFile, copiedFile);
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
  });
  const status = await p.status();
  await p.close();
  members.assert.equal(status.code, 0);
  members.assert.equal(status.success, true);
  // assert each file and it's content are correct
  let boilerPlateFile;
  let copiedFile;
  // app.ts
  members.assert.equal(await fileExists("app.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/app_web_app.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("app.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // deps.ts
  members.assert.equal(await fileExists("deps.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/deps.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("deps.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // config.ts
  members.assert.equal(await fileExists("config.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/config.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("config.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // home_resource.ts
  members.assert.equal(await fileExists("resources/home_resource.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/resources/home_resource.ts",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("resources/home_resource.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // home_resource_test.ts
  members.assert.equal(
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
  members.assert.equal(boilerPlateFile, copiedFile);
  // public/views/js/index.js
  members.assert.equal(await fileExists("public/js/index.js"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/public/js/index.js"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("public/js/index.js"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // public/css/index.css.ts
  members.assert.equal(await fileExists("public/css/index.css"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/public/css/index.css"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("public/css/index.css"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // public/views/index.html.ts
  members.assert.equal(await fileExists("public/views/index.html"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/public/views/index.html",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("public/views/index.html"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // public/img.ts
  members.assert.equal(await fileExists("public/img"), true);
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
  });
  const status = await p.status();
  await p.close();
  members.assert.equal(status.code, 0);
  members.assert.equal(status.success, true);
  // assert each file and it's content are correct
  let boilerPlateFile;
  let copiedFile;
  // app.ts
  members.assert.equal(await fileExists("app.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/app_web_app.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("app.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // deps.ts
  members.assert.equal(await fileExists("deps.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/deps.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("deps.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // config.ts
  members.assert.equal(await fileExists("config.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/config.ts"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("config.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // home_resource.ts
  members.assert.equal(await fileExists("resources/home_resource.ts"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/resources/home_resource.ts",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("resources/home_resource.ts"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // home_resource_test.ts
  members.assert.equal(
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
  members.assert.equal(boilerPlateFile, copiedFile);
  // public/img.ts
  members.assert.equal(await fileExists("public/img"), true);
  // webpack.config.js
  members.assert.equal(await fileExists("webpack.config.js"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(
      originalCWD + "/console/create_app/webpack_vue.config.js",
    ),
  );
  copiedFile = decoder.decode(Deno.readFileSync("webpack.config.js"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // package.json
  members.assert.equal(await fileExists("package.json"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/package_vue.json"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("package.json"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // vue/App.vue
  members.assert.equal(await fileExists("vue"), true);
  members.assert.equal(await fileExists("vue/App.vue"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/vue/app.vue"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("vue/App.vue"));
  members.assert.equal(boilerPlateFile, copiedFile);
  // vue/app.js
  members.assert.equal(await fileExists("vue/app.js"), true);
  boilerPlateFile = decoder.decode(
    Deno.readFileSync(originalCWD + "/console/create_app/vue/app.js"),
  );
  copiedFile = decoder.decode(Deno.readFileSync("vue/app.js"));
  members.assert.equal(boilerPlateFile, copiedFile);

  Deno.chdir(originalCWD);
  Deno.removeSync(tmpDirName, { recursive: true });
});

members.test("create_app_test.ts | Script fails if --with-vue is set but --web-app isn\'t", async () => {
  const p = await Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-run",
      "create_app.ts",
      "--with-vue",
    ],
  });
  const status = await p.status();
  await p.close();
  members.assert.equal(status.code, 1);
  members.assert.equal(status.success, false);
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
  });
  const status = await p.status();
  await p.close();
  members.assert.equal(status.code, 1);
  members.assert.equal(status.success, false);
});
