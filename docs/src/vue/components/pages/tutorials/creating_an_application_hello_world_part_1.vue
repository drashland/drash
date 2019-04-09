<template lang="pug">
div
    page-header(:route="$route")
    div.row
        div.col
            hr
            h2 Table Of Contents
            ul
                li <a :href="'/#' + $route.path + '#before-you-get-started'">Before You Get Started</a>
                li <a :href="'/#' + $route.path + '#folder-structure-end-state'">Folder Structure End State</a>
                li <a :href="'/#' + $route.path + '#steps'">Steps</a>
                li <a :href="'/#' + $route.path + '#what-is-the-code-doing'">What Is The Code Doing?</a>
    div.row
        div.col
            hr
            h2#before-you-get-started Before You Get Started
            ul
                li-download-source-code(:source_code_uri="$route.meta.source_code_uri")
                li This code assumes you have Deno installed. If you do not, then head over to <a href="https://deno.land/" target="_BLANK">https://deno.land/</a> to install Deno.
    div.row
        div.col
            hr
            h2#folder-structure-end-state Folder Structure End State
            ul
                li Upon completing this tutorial, your project's folder structure should look similar to:
                    code-block(:data="example_code.folder_structure")
    div.row
        div.col
            hr
            h2#steps Steps
            ol
                li Create your app file.
                    code-block(:data="example_code.app")
                li Run your app.
                    code-block(:data="example_code.run")
                    p When you start your app, you should see the following in the terminal:
                    code-block(:data="example_code.output")
    div.row
        div.col
            hr
            h2#what-is-the-code-doing What Is The Code Doing?
            h3 <code>/path/to/your/project/app.ts</code>
            ol
                li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
                li A resource class named <code>HomeResource</code> is created.
                    ul
                        li <code>HomeResource</code> contains a <code>GET()</code> method. This method will handle all <code>GET</code> requests to <code>HomeResource</code>. When a client makes a <code>GET</code> request to <code>HomeResource</code>, the response the client will receive is "Hello World!" as written in the <code>response</code> object's <code>body</code> property. All resources have access to the <code>response</code> object via <code>this.response</code>.
                        li The path (a.k.a. URI) that <code>HomeResource</code> opens up to clients is <code>/</code> (in the <code>static paths</code> property). This means clients can only access <code>HomeResource</code> through the <code>/</code> URI.
                        li All resource classes MUST extend <code>Drash.Http.Resource</code>. You can create your own base resource class, but your base resource class has to extend <code>Drash.Http.Resource</code> before it can be extended further.
                li The Drash server is created.
                    ul
                        li The address for the server is set to <code>localhost:8000</code>. This means the full address to <code>HomeResource</code> is <code>localhost:8000/</code>.
                        li The default response output is set to <code>text/html</code>. This means all responses from the server will default to the <code>text/html</code> MIME type. By default, Drash servers can handle the following types: <code>text/html</code>, <code>application/json</code>, <code>application/xml</code>, and <code>text/xml</code>. If you want your Drash server to handle more content types, then read the following tutorial: <a href="/#/tutorials/adding-content-types">Adding Content Types</a>.
                        li The Drash server is given one resource: <code>HomeResource</code>.
                li The Drash server's <code>run()</code> method is invoked so that when <code>app.ts</code> is passed to the <code>deno</code> command in the terminal, the Drash server is started.
            h3 <code>deno</code> (in the terminal)
            ol
                li Deno runs <code>/path/to/your/project/app.ts</code> and:
                    ol
                        li Allows network access via <code>--allow-net</code> flag.
                        li Allows environment access via <code>--allow-env</code> flag.
                    p The <code>--allow-net</code> flag is added so that the server will work.
                    p The <code>--allow-env</code> flag is added because <code>Drash.Http.Response</code> objects require environment access if they're setup to serve static paths. Serving static paths isn't setup in this tutorial, but the <code>Drash.Http.Response</code> class compiles with the code that requires access to the environment. This means the <code>--allow-env</code> flag is always required.
    end-of-tutorial
</template>

<script>
export const resource = {
    paths: ["/tutorials/creating-an-application-hello-world-part-1"],
    meta: {
        title: "Creating An Application: Hello World (Part 1)",
        source_code_uri: "/creating_an_application_hello_world_part_1"
    }
}

export default {
    data() {
        return {
            example_code: this.$app_data.example_code.tutorials.creating_an_application_hello_world_part_1
        };
    },
}
</script>
