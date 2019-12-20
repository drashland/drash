<template lang="pug">
page-creating-an-app-hello-world(:data="data")
    template(v-slot:steps)
        ol
            li Create your app file.
                code-block(:data="data.example_code.app")
            li Run your app.
                code-block(:data="data.example_code.run")
                p When you start your app, you should see the following in the terminal:
                code-block(:data="data.example_code.output")
    template(v-slot:what-is-the-code-doing)
        h3 <code>app.ts</code>
        ol
            li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
            li A resource class named <code>HomeResource</code> is created.
                ul
                    li <code>HomeResource</code> contains a <code>GET()</code> method. This method will handle all <code>GET</code> requests to <code>HomeResource</code>. When a client makes a <code>GET</code> request to <code>HomeResource</code>, the response the client will receive is "Hello World!" as written in the <code>response</code> object's <code>body</code> property. All resources have access to the <code>response</code> object via <code>this.response</code>.
                    li The path (a.k.a. URI) that <code>HomeResource</code> opens up to clients is <code>/</code> (in the <code>static paths</code> property). This means clients can only access <code>HomeResource</code> through the <code>/</code> URI.
                    li All resource classes MUST extend <code>Drash.Http.Resource</code>. You can create your own base resource class, but your base resource class has to extend <code>Drash.Http.Resource</code> before it can be extended further.
            li The Drash server is created.
                ul
                    li The address for the server is set to <code>localhost:1337</code>. This means the full address to <code>HomeResource</code> is <code>localhost:1337/</code>.
                    li The default response output is set to <code>text/html</code>. This means all responses from the server will default to the <code>text/html</code> MIME type. By default, Drash servers can handle the following types: <code>text/html</code>, <code>application/json</code>, <code>application/xml</code>, and <code>text/xml</code>. Drash servers can handle more content types, but you have to add that code. Read <a :href="$conf.base_url + '/#/tutorials/adding-content-types'">Adding Content Types</a> for more information.
                    li The Drash server is given one resource: <code>HomeResource</code>.
            li The Drash server's <code>run()</code> method is invoked so that when <code>app.ts</code> is passed to the <code>deno</code> command in the terminal, the Drash server is started.
        h3 <code>deno</code> (in the terminal)
        ol
            li Deno runs <code>app.ts</code> and:
                ol
                    li Allows network access via <code>--allow-net</code> flag.
                    li Allows environment access via <code>--allow-env</code> flag.
                p The <code>--allow-net</code> flag is added so that the server will work.
                p The <code>--allow-env</code> flag is added because <code>Drash.Http.Response</code> objects require environment access if they're setup to serve static paths. Serving static paths isn't setup in this tutorial, but the <code>Drash.Http.Response</code> class compiles with the code that requires access to the environment. This means the <code>--allow-env</code> flag is always required.
    template(v-slot:screenshot)
        a(:href="$conf.base_url + '/public/assets/img/creating_an_app_hello_world_part_1.png'")
            img(:src="$conf.base_url + '/public/assets/img/creating_an_app_hello_world_part_1.png'")
        div.row
            div.col.text-right
                a.btn.btn-success(:href="$conf.base_url + '/#/tutorials/creating-an-app-hello-world-part-2'") Go to Part 2
</template>

<script>
export const resource = {
    paths: ["/advanced-tutorials/creating-a-web-app/hello-world/part-1"],
    meta: {
        title: "Creating An App: Hello World Part 1 of 4: Handling GET Requests",
        tutorial_title: "Part 1 of 4: Handling GET Requests",
        source_code_uri: "/advanced_tutorials/creating_a_web_app/hello_world/part_1"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code['/docs/src/example_code/advanced_tutorials/creating_a_web_app/hello_world/part_1'],
            }
        };
    },
}
</script>
