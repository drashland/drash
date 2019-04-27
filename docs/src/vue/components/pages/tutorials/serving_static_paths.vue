<template lang="pug">
page-tutorial-default(
    :data="data"
    :custom="true"
)
    template(v-slot:custom)
        div.row
            div.col
                hr
                h2 Table Of Contents
                ul-toc(:data="data.toc")
        div.row
            div.col
                hr
                h2#before-you-get-started Before You Get Started
                ul
                    li If you're using Drash to build a web app, then you might want to serve static paths that contain your CSS files, JS files, etc.
                    li Drash uses <a href="https://raw.githubusercontent.com/jshttp/mime-db/v1.39.0/db.json">db.json from mime-db v1.39.0</a> for its MIME type database. It does not use deno_std's <a href="https://github.com/denoland/deno_std/tree/master/media_types" target="_BLANK">media_types</a> module.
                    li If you want to see how Drash finds a MIME type of a file, then look at 
                        a(href="https://github.com/crookse/deno-drash/blob/a85a294de13a1863c880169772a9b1eaa710a0e3/src/services/http_service.ts#L132" target="_BLANK") line 132 of http_service.ts
                        | . Note that the <code>MimeDb</code> dictionary in this file is set in 
                        a(href="https://github.com/crookse/deno-drash/blob/a85a294de13a1863c880169772a9b1eaa710a0e3/mod.ts#L46" target="_BLANK") mod.ts
                        |  and is a direct import of db.json.
                    list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
        div.row
            div.col
                hr
                h2#folder-structure-end-state Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="data.example_code.folder_structure")
        div.row
            div.col
                hr
                h2#steps Steps
                ol
                    li Serving static files requires you to set the following environment variable: <code>DRASH_SERVER_DIRECTORY</code>. You can add it using the terminal ...
                        code-block-slotted(:header="false")
                            template(#code)
                                | export DRASH_SERVER_DIRECTORY="/path/to/your/project"
                        p ... or add it in your <code>app.ts</code> file using <code>Deno.env()</code>.
                        code-block-slotted(:header="false")
                            template(#code)
                                | Deno.env().DRASH_SERVER_DIRECTORY = "/path/to/your/project";
                        p The <code>DRASH_SERVER_DIRECTORY</code> environment variable is the directory that contains your <code>app.ts</code> file. In this tutorial, it's <code>/path/to/your/project</code>.
                        p Do NOT add a trailing slash to the <code>DRASH_SERVER_DIRECTORY</code> environment variable. Doing so will cause Drash to parse the path with double slashes:
                        code-block-slotted(:header="false")
                            template(#code) /path/to/your/project//your-static-path/some-file.extension
                        p The logic that handles static paths will prepend the value of the <code>DRASH_SERVER_DIRECTORY</code> environment variable to each static path listed in the <code>static_paths</code> config in Step 2.
                    li Create your app file.
                        ul
                            li Take note of the <code>static_paths</code> config. This is the config that tells your Drash server what paths contain static files.
                        code-block(:data="data.example_code.app")
                    li Create your HTTP resource class file and have it serve an HTML document (as a string) with your <code>style.css</code> file that's located in your <code>/public</code> directory.
                        code-block(:data="data.example_code.home_resource")
                    li Create your <code>style.css</code> file.
                        code-block(:data="data.example_code.public.style" title="/path/to/your/project/public/style.css")
                    li Run your app.
                        code-block(:data="data.example_code.run")
        div.row
            div.col
                hr
                h2#what-is-the-code-doing What Is The Code Doing?
                h3 <code>app.ts</code>
                ol
                    li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
                    li The <code>HomeResource</code> class is imported to be used in the Drash server's <code>resources</code> config.
                    li The Drash server is created.
                        ul
                            li The address for the server is set to <code>localhost:1337</code>. This means the full address to <code>HomeResource</code> is <code>localhost:1337/</code>.
                            li The default response output is set to <code>text/html</code>. This means all responses from the server will default to the <code>text/html</code> MIME type. By default, Drash servers can handle the following types: <code>text/html</code>, <code>application/json</code>, <code>application/xml</code>, and <code>text/xml</code>. Drash servers can handle more content types, but you have to add that code. Read <a :href="$conf.base_url + '/#/tutorials/adding-content-types'">Adding Content Types</a> for more information.
                            li The Drash server is given one resource: <code>HomeResource</code>.
                    li The Drash server's <code>run()</code> method is invoked so that when <code>app.ts</code> is passed to the <code>deno</code> command in the terminal, the Drash server is started.
                h3 <code>home_resource.ts</code>
                ol
                    li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
                    li <code>HomeResource</code> contains a <code>GET()</code> method. This method will handle all <code>GET</code> requests to <code>HomeResource</code>. When a client makes a <code>GET</code> request to <code>HomeResource</code>, the response the client will receive is the HTML assigned to the <code>response</code> object's <code>body</code> property. All resources have access to the <code>response</code> object via <code>this.response</code>.
                    li The HTML that <code>HomeResource</code> sets in the <code>response</code> object's <code>body</code> property has a <code>link</code> tag in the <code>head</code> tag that references <code>/public/style.css</code>. This means when the client receives the initial HTML response, the browser will make a subsequent request for the <code>style.css</code> file. When the Drash server receives the request for the <code>style.css</code> file, it will return the contents of the <code>style.css</code> file and set the response's <code>Content-Type</code> header to the correct MIME type (<code>text/css</code>), so the browser can properly handle the <code>style.css</code> file. The <code>style.css</code> sets <code>.my-text</code> to red.
                    li The path (a.k.a. URI) that <code>HomeResource</code> opens up to clients is <code>/</code> (in the <code>static paths</code> property). This means clients can only access <code>HomeResource</code> through the <code>/</code> URI.
                    li All resource classes MUST extend <code>Drash.Http.Resource</code>. You can create your own base resource class, but your base resource class has to extend <code>Drash.Http.Resource</code> before it can be extended further.
                h3 <code>deno</code> (in the terminal)
                ol
                    li Deno runs <code>app.ts</code> and:
                        ol
                            li Allows network access via <code>--allow-net</code> flag.
                            li Allows environment access via <code>--allow-env</code> flag.
                        p The <code>--allow-net</code> flag is added so that the server will work.
                        p The <code>--allow-env</code> flag is added because <code>Drash.Http.Response</code> objects require environment access if they're setup to serve static paths. Serving static paths isn't setup in this tutorial, but the <code>Drash.Http.Response</code> class compiles with the code that requires access to the environment. This means the <code>--allow-env</code> flag is always required.
        div.row
            div.col
                hr
                h2#screenshot Screenshot
                p Your app should look like the following when you've completed this tutorial:
                router-link(href="/public/assets/img/serving_static_paths.png")
                    img(:src="$conf.base_url + '/public/assets/img/serving_static_paths.png'")
</template>

<script>
export const resource = {
    paths: ["/tutorials/serving-static-paths"],
    meta: {
        title: "Serving Static Paths",
        source_code_uri: "/serving_static_paths"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.serving_static_paths,
                toc: {
                    items: [
                        "Before You Get Started",
                        "Folder Structure End State",
                        "Steps",
                        "What Is The Code Doing?",
                        "Screenshot"
                    ]
                }
            }
        };
    },
}
</script>
