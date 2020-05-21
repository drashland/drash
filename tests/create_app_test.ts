import members from "./members.ts";
const tmpDirName = 'tmp-dir-for-testing-create-app'
const originalCWD = Deno.cwd()

/**
 * File requires the following flags: --allow-read, --allow-write, --allow-run
 */

members.test("create_app_test.ts | Script fails with no argument", async () => {
    const p = await Deno.run({
        cmd: ['deno', 'run', '--allow-read', '--allow-write', '--allow-run', 'create_app.ts']
    })
    const status = await p.status()
    await p.close()
    members.assert.equal(status.code, 1);
    members.assert.equal(status.success, false)
})

members.test("create_app_test.ts | Script success with the --help argument", async () => {
    const p = await Deno.run({
        cmd: ['deno', 'run', '--allow-read', '--allow-write', '--allow-run', 'create_app.ts', '--help']
    })
    const status = await p.status()
    await p.close()
    members.assert.equal(status.code, 0);
    members.assert.equal(status.success, true)
})

members.test("create_app_test.ts | Script creates an API project with the --api argument", async () => {
    Deno.mkdirSync(tmpDirName)
    Deno.chdir(tmpDirName)
    const p = await Deno.run({
        cmd: ['deno', 'run', '--allow-read', '--allow-write', '--allow-run', '../create_app.ts', '--api']
    })
    const status = await p.status()
    await p.close()
    members.assert.equal(status.code, 0);
    members.assert.equal(status.success, true)
    // TODO :: Assert files exist and content is the same
    // ...
    Deno.chdir(originalCWD)
    Deno.removeSync(tmpDirName, { recursive: true })
})

members.test("create_app_test.ts | Script creates a web app with the --web-app argument", async () => {
    Deno.mkdirSync(tmpDirName)
    Deno.chdir(tmpDirName)
    const p = await Deno.run({
        cmd: ['deno', 'run', '--allow-read', '--allow-write', '--allow-run', '../create_app.ts', '--web-app']
    })
    const status = await p.status()
    await p.close()
    members.assert.equal(status.code, 0);
    members.assert.equal(status.success, true)
    // TODO :: Assert files exist and content is the same
    // ...
    Deno.chdir(originalCWD)
    Deno.removeSync(tmpDirName, { recursive: true })
})

members.test("create_app_test.ts | Script creates a web app with vue with the --web-app and --with-vue arguments", async () => {
    Deno.mkdirSync(tmpDirName)
    Deno.chdir(tmpDirName)
    const p = await Deno.run({
        cmd: ['deno', 'run', '--allow-read', '--allow-write', '--allow-run', '../create_app.ts', '--web-app', '--with-vue']
    })
    const status = await p.status()
    await p.close()
    members.assert.equal(status.code, 0);
    members.assert.equal(status.success, true)
    // TODO :: Assert files exist and content is the same
    // ...
    Deno.chdir(originalCWD)
    Deno.removeSync(tmpDirName, { recursive: true })
})

members.test("create_app_test.ts | Script fails if --with-vue is set but --web-app isn\'t", async () => {
    const p = await Deno.run({
        cmd: ['deno', 'run', '--allow-read', '--allow-write', '--allow-run', '../create_app.ts', '--with-vue']
    })
    const status = await p.status()
    await p.close()
    members.assert.equal(status.code, 1);
    members.assert.equal(status.success, false)
})

members.test("create_app_test.ts | Script fails if --api and --web-app are specified", async () => {
    const p = await Deno.run({
        cmd: ['deno', 'run', '--allow-read', '--allow-write', '--allow-run', '../create_app.ts', '--api', '--web-app']
    })
    const status = await p.status()
    await p.close()
    members.assert.equal(status.code, 1);
    members.assert.equal(status.success, false)
})
