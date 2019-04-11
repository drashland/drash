<template lang="pug">
div
    page-header(:route="$route")
    div.row
        div.col
            p This page will be available on April 12, 2019 or sooner.
//- page-creating-an-app-hello-world(:data="data")
    template(v-slot:steps)
    //- template(v-slot:what-is-the-code-doing)
        h3 <code>index.ejs</code>
        ol
            li This code imports <a href="https://tailwindcss.com/" target="_BLANK">Tailwinds CSS</a> and uses its <a href="https://tailwindcss.com/docs/examples/cards" target="_BLANK">card</a> element to create a nice little UI for this tutorial.
            li The card element contains a template variable (<code><%= body %></code>) which will take the value of <code>this.response.body</code> from <code>HomeResource</code>.
        h3 <code>app.ts</code>
        ol
            li The <code>renderFile</code> function from <a href="https://github.com/syumai/dejs" target="_BLANK">dejs</a> is imported so that the <code>Response</code> class can use it to render <code>index.ejs</code>.
            li A response class extends <code>Drash.Http.Response</code> so that its <code>send()</code> method can be overridden to allow <a href="https://github.com/syumai/dejs" target="_BLANK">dejs</a> rendering.
            li <code>Drash.Http.Response</code> is replaced with <code>Response</code> so that <code>Drash.Http.Server</code> uses the <code>Response</code> class that contains the <a href="https://github.com/syumai/dejs" target="_BLANK">dejs</a> template engine logic.
            li The rest of the code works as it did in Part 1 of 4.
        h3 <code>deno</code> (in the terminal)
        ol
            li Deno runs <code>app.ts</code> as it did in Part 1 of 4 with one change:
                ol
                    li Read access is allowed via <code>--allow-read</code> flag.
                p The <code>--allow-read</code> flag is added because <code>Response</code> needs to read the contents of <code>index.ejs</code>.
    //- template(v-slot:screenshot)
        a(href="/public/assets/img/creating_an_app_hello_world_part_3.png")
            img(src="/public/assets/img/creating_an_app_hello_world_part_3.png")
</template>

<script>
export const resource = {
    paths: ["/tutorials/creating-an-app-hello-world-part-4"],
    meta: {
        title: "Creating An App: Hello World (Part 4 of 4)",
        source_code_uri: "/creating_an_app_hello_world_part_4"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.creating_an_app_hello_world_part_2
            }
        };
    },
}
</script>
