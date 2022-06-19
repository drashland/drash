import { Jae } from "../../../src/services/tengine/jae.ts"

Deno.test("render()", async t => {
    await t.step("Should handle no trailing or leading slashes", () => {
        const jae = new Jae('./tests/data')
        jae.render('index.html', {})
    })
    await t.step("Should handle both trailing and leading slashes", () => {
        const jae = new Jae('./tests/data/')
        jae.render('/index.html', {})
    })
    await t.step("Should handle trailing or leading slashes", () => {
        const jae = new Jae('./tests/data')
        jae.render('/index.html', {})
        const jae2 = new Jae('./tests/data/')
        jae2.render('index.html', {})
    })
})