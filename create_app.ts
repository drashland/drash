const { args } = Deno
const wantsHelp = (args.find(arg => arg === '--help') !== undefined)
const wantsWebApp = (args.find(arg => arg === '--web-app') !== undefined)
const wantsApi = (args.find(arg => arg === '--api') !== undefined)
const wantsVue = (args.find(arg => arg === '--with-vue') !== undefined)

// TODO :: Boiler plate directory to copy?

//////////////////////////////////////////////////////////////////////////////
// FILE MARKER - FUNCTIONS ///////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

/**
 * Responsible for showing the help message when a user uses `--help`
 */
function showHelp () {
    const helpMessage =
        '\n' +
        'A create app script for Drash' +
        '\n' +
        '\n' +
        'USAGE:' +
        '\n' +
        '    deno run --allow-read --allow-run create_app.ts [OPTIONS]' +
        '\n' +
        '    deno run --allow-read --allow-run https://deno.land/x/drash/create_app.ts [OPTIONS]' +
        '\n' +
        '\n' +
        'OPTIONS:' +
        '\n' +
        'The --api and --web-app options cannot be used together' +
        '\n' +
        '\n' +
        '    --api' +
        '\n' +
        '        Creates the file structure and content for a Drash API' +
        '\n' +
        '\n' +
        '    --web-app' +
        '\n' +
        '        Creates the file structure and content for a Web App using Drash' +
        '\n' +
        '\n' +
        '    --with-vue' +
        '\n' +
        '        Adds support right off the bat for Vue to be used in your web app.' +
        '\n' +
        '        Can only be used with the --web-app option' +
        '\n' +
        '\n' +
        'EXAMPLE:' +
        '\n' +
        '    mkdir my-drash-api' +
        '\n' +
        '    cd my-drash-api' +
        '\n' +
        '    deno run --allow-read --allow-run https://deno.land/x/drash/create_app.ts --api' +
        '\n'
    Deno.run({
        cmd: ['echo', helpMessage]
    })
    Deno.exit()
}

/**
 * On writing to and creating files, we send a message to stdout to let the user know something
 * is happening
 *
 * @param {string} message Message to show in the console
 *
 * @example
 * writeFileWrittenOrCreatedMessage('Created deps.ts') // "Created deps.ts" in green
 */
function writeFileWrittenOrCreatedMessage (message: string) {
    // TODO
}

function buildTheBaseline () {
    // TODO :: Should create the following: app.ts, deps.ts, resources/home_resource.ts, config.ts, tests/resources/home_resource_test.ts, middleware/
}

/**
 * Responsible for all the logic around creating a web app
 */
function buildForWebApp () {
    // TODO :: Main logic
    // TODO :: Account for if user wants vue
}

/**
 * Responsible for all the logic around creating an api
 */
function buildForAPI () {
    // TODO :: Main logic
}

//////////////////////////////////////////////////////////////////////////////
// FILE MARKER - ENTRY POINT LOGIC ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

// Requirement: Now allowed to ask for an API AND Web App
if (wantsApi && wantsWebApp) {
    Deno.run({
        cmd: ['echo', '--web-app and --api options are now allowed to be used together. Use the --help option on how to run this script']
    })
    Deno.exit(1)
}

// Requirement: One main argument is required
const tooFewArgs = !wantsHelp && !wantsWebApp && !wantsApi
if (tooFewArgs) {
    Deno.run({
        cmd: ['echo', 'Too few options were given. Use the --help option on how to run this script']
    })
    Deno.exit(1)
}

// Requirement: --with-vue is only allowed to be used with --web-app
if (wantsVue && !wantsWebApp) {
    Deno.run({
        cmd: ['echo', 'The --with-vue option is only allowed for use with a web app. Use the --help option on how to run this script']
    })
    Deno.exit(1)
}

// Requirement: Add a --help option
if (wantsHelp) {
    showHelp()
}

// Requirement: Add support for building a Drash API (--api)
if (wantsApi) {
    buildTheBaseline()
    buildForWebApp()
}

// Requirement: Add support for building a web app (--web-app)
if (wantsWebApp) {
    buildTheBaseline()
    buildForAPI()
}