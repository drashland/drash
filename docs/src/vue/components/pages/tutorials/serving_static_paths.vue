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
                        ul
                            li <code>--allow-read</code> is required so Deno can read the contents of your <code>style.css</code> file and serve its contents to the client.
                        code-block(:data="data.example_code.run")
        div.row
            div.col
                hr
                h2#screenshot Screenshot
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
                        "Screenshot"
                    ]
                }
            }
        };
    },
}
</script>
