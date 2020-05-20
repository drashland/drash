const { args } = Deno
const wantsHelp = (args.find(arg => arg === '--help') !== undefined)
const wantsWebApp = (args.find(arg => arg === '--web-app') !== undefined)
const wantsApi = (args.find(arg => arg === '--api') !== undefined)
const tooManyArgs = [wantsHelp, wantsApi, wantsWebApp].filter(arg => arg).length > 1

function showHelp () {
    const helpMessage =
        'A create app script for Drash' +
        '\n' +
        '\n' +
        'USAGE:' +
        '\n' +
        '    deno run --allow-read --allow-run create_app.ts [OPTIONS]' +
        '\n' +
        '\n' +
        'OPTIONS:' +
        '\n' +
        'Only one option can be used' +
        '\n' +
        '\n' +
        '    --api' +
        '\n' +
        '        Creates the file structure and content for a Drash API' +
        '\n' +
        '\n' +
        '    --web-app' +
        '\n' +
        '        Creates the file structure and content for a Web App using Drash'
    Deno.run({
        cmd: ['echo', helpMessage]
    })
    Deno.exit()
}

if (tooManyArgs) {
    Deno.run({
        cmd: ['echo', 'Too many options were given. Please limit them to 1, for example only using `--api`']
    })
    Deno.exit(1)
}

if (wantsHelp) {
    showHelp()
}

if (wantsApi) {

}

if (wantsWebApp) {

}