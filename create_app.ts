import { green, red } from "./deps.ts";
const { args } = Deno;
const drashDir = Deno.build.os === "windows"
  ? import.meta.url.replace("file:///", "").replace("/create_app.ts", "")
  : import.meta.url.replace("file://", "").replace("/create_app.ts", "");
const wantsHelp = (args.find((arg) => arg === "--help") !== undefined);
const wantsWebApp = (args.find((arg) => arg === "--web-app") !== undefined);
const wantsApi = (args.find((arg) => arg === "--api") !== undefined);
const wantsVue = (args.find((arg) => arg === "--with-vue") !== undefined);
const cwd = Deno.realPathSync(".");
const notesForUser: string[] = [];
const encoder = new TextEncoder();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - FUNCTIONS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Fetch a file from the create_app directory and copy its contents to the
 * specified output file.
 *
 * @param string filePath
 * @param string outputFile
 */
async function copyFile(filePath: string, outputFile: string): Promise<void> {
  const fullFilePath = Deno.build.os === "windows"
    ? `${drashDir}/console/create_app${filePath}`.replace(/\//g, "\\")
    : `${drashDir}/console/create_app${filePath}`;
  outputFile = Deno.build.os === "windows"
    ? outputFile.replace(/\//g, "\\")
    : outputFile;
  console.info(`Copy ${fullFilePath} contents to:`);
  console.info(`  ${cwd}${outputFile}`);
  console.log(import.meta.url);
  try {
    const response = await fetch(fullFilePath);
    const contents = encoder.encode(await response.text());
    Deno.writeFileSync(cwd + outputFile, contents);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Responsible for showing the help message when a user uses `--help`
 */
function showHelp() {
  const helpMessage = "\n" +
    "A create app script for Drash" +
    "\n" +
    "\n" +
    "USAGE:" +
    "\n" +
    "    deno run --allow-read --allow-run [--allow-write --allow-net] create_app.ts [OPTIONS]" +
    "\n" +
    "    deno run --allow-read --allow-run [--allow-write --allow-net] https://deno.land/x/drash/create_app.ts [OPTIONS]" +
    "\n" +
    "\n" +
    "OPTIONS:" +
    "\n" +
    "The --api and --web-app options cannot be used together." +
    "\n" +
    "\n" +
    "    --api" +
    "\n" +
    "        Creates the file structure and content for a Drash API." +
    "\n" +
    "\n" +
    "    --web-app" +
    "\n" +
    "        Creates the file structure and content for a Drash Web App." +
    "\n" +
    "\n" +
    "    --web-app --with-vue" +
    "\n" +
    "        Creates the file structure and content for a Drash Web App." +
    "\n" +
    "        This options requires Node and npm because it uses Vue and webpack." +
    "\n" +
    "\n" +
    "EXAMPLE USAGE:" +
    "\n" +
    "    mkdir my-drash-api" +
    "\n" +
    "    cd my-drash-api" +
    "\n" +
    "    deno run --allow-read --allow-run --allow-write --allow-net https://deno.land/x/drash/create_app.ts --api" +
    "\n";
  console.info(helpMessage);
}

/**
 * On writing to and creating files, we send a message to stdout to let the user know something
 * is happening
 *
 * @param string message Message to show in the console. Required.
 */
function writeFileWrittenOrCreatedMessage(message: string) {
  console.info(green(message));
}

/**
 * Send our thank you message for using it
 */
function sendThankYouMessage() {
  notesForUser.push(
    "To run your application:",
    "    deno run --allow-net --allow-read app.ts",
  );
  const whatUserWanted = wantsApi
    ? "Your Drash API project "
    : wantsWebApp && !wantsVue
    ? "Your Drash web app project "
    : wantsWebApp && wantsVue
    ? "Your Drash web app project with Vue "
    : "";
  console.info(
    whatUserWanted + "has been created.\n" +
      "Thank you for using Drash's create app script, we hope you enjoy your newly built project!\n" +
      notesForUser.join("\n"),
  );
}

async function buildTheBaseline() {
  let contents;
  await copyFile("/deps.ts", "/deps.ts");
  await copyFile("/config.ts", "/config.ts");
  Deno.mkdirSync(cwd + "/middleware");
  Deno.mkdirSync(cwd + "/tests/resources", { recursive: true });
  await copyFile(
    "/tests/resources/home_resource_test.ts",
    "/tests/resources/home_resource_test.ts",
  );
}

/**
 * Responsible for all the logic around creating a web app
 */
async function buildForWebApp() {
  await copyFile("/app_web_app.ts", "/app.ts");
  Deno.mkdirSync(cwd + "/public/views", { recursive: true });
  Deno.mkdirSync(cwd + "/public/css", { recursive: true });
  Deno.mkdirSync(cwd + "/public/js", { recursive: true });
  Deno.mkdirSync(cwd + "/public/img", { recursive: true });
  Deno.mkdirSync(cwd + "/resources");
  await copyFile("/resources/home_resource.ts", "/resources/home_resource.ts");

  if (wantsVue) {
    await copyFile("/package_vue.json", "/package.json");
    await copyFile("/webpack_vue.config.js", "/webpack.config.js");
    Deno.mkdirSync(cwd + "/vue");
    await copyFile("/vue/app.js", "/vue/app.js");
    await copyFile("/vue/app.vue", "/vue/App.vue");
    await copyFile("/public/views/index_vue.html", "/public/views/index.html");
    notesForUser.push("Install NPM dependencies:\n    npm install");
    notesForUser.push(
      "Build your Vue component with Webpack:\n    npm run buildVue",
    );
  } else {
    await copyFile("/public/views/index.html", "/public/views/index.html");
    await copyFile("/public/css/index.css", "/public/css/index.css");
    await copyFile("/public/js/index.js", "/public/js/index.js");
  }
}

/**
 * Responsible for all the logic around creating an api - eg omits views, js files
 */
async function buildForAPI() {
  await copyFile("/app_api.ts", "/app.ts");
  Deno.mkdirSync(cwd + "/resources");
  await copyFile(
    "/resources/home_resource_api.ts",
    "/resources/home_resource.ts",
  );
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - ENTRY POINT LOGIC /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Requirement: Now allowed to ask for an API AND Web App
if (wantsApi && wantsWebApp) {
  console.error(
    red(
      "--web-app and --api options are not allowed to be used together. Use the --help option for more information.",
    ),
  );
  Deno.exit(1);
}

// Requirement: One main argument is required
const tooFewArgs = !wantsHelp && !wantsWebApp && !wantsApi;
if (tooFewArgs) {
  console.error(
    red(
      "Too few options were given. Use the --help option for more information.",
    ),
  );
  Deno.exit(1);
}

// Requirement: Add a --help option
if (wantsHelp) {
  showHelp();
  Deno.exit();
}

// Requirement: Add support for building a Drash API (--api)
if (wantsApi) {
  await buildTheBaseline();
  await buildForAPI();
  sendThankYouMessage();
  Deno.exit();
}

// Requirement: Add support for building a web app (--web-app [--with-vue])
if (wantsWebApp) {
  await buildTheBaseline();
  await buildForWebApp();
  sendThankYouMessage();
  Deno.exit();
}
