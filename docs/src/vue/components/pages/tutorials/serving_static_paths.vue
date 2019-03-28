<template lang="pug">
div
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 {{ $route.meta.title }}
    hr
    div.c-page__body
        div.row
            div.col
                h2(id="table-of-contents") Table of Contents
                ul
                    li
                        a(:href="$conf.base_url + '/#/tutorials/serving-static-paths#serving-static-paths'") Serving Static Paths
                    li
                        a(:href="$conf.base_url + '/#/tutorials/serving-static-paths#how-it-works'") How It Works
        hr
        div.row
            div.col
                h2(id="server-logging-to-the-terminal") Serving Static Paths
                h3 Before you get started
                ul
                    li If you're using Drash to build a web app, then you might want to serve static paths that contain your CSS files, JS files, etc.
                    li You can download the source code for this tutorial here.
                h3 Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="example_code.serving_static_paths.folder_structure")
                h3 Steps
                ol
                    li Perform the initial setup of your project.
                        ul
                            li Serving static files requires you to set the following environment variable: <code>DRASH_SERVER_DIRECTORY</code>
                            li The <code>DRASH_SERVER_DIRECTORY</code> environment variable is the directory that contains your <code>app.ts</code> file. In this tutorial, it's <code>/path/to/your/project</code>.
                            li Do NOT add a trailing slash to the <code>DRASH_SERVER_DIRECTORY</code> environment variable. Doing so will cause Drash to parse the path as <code>/path/to/your/project//your-static-path/some-file.extension</code>.
                        code-block(:data="example_code.serving_static_paths.folder_structure_setup")
                        li Create your HTTP resource class file and have it serve an HTML document (as a string) with your <code>style.css</code> file that's located in your <code>public</code> directory.
                        code-block(:data="example_code.serving_static_paths.home_resource")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                            li Take note of the <code>static_paths</code> config. This is the config that tells your Drash server what paths contain static files.
                        code-block(:data="example_code.serving_static_paths.app")
                    li Create your <code>style.css</code> file.
                        code-block(:data="example_code.serving_static_paths.public.style" title="/path/to/your/project/public/style.css")
                    li Run your app.
                        ul
                            li <code>--allow-read</code> is required so Deno can read the contents of your <code>style.css</code> file and serve its contents to the client.
                        div.b-code-example
                            pre.header
                                code.header Terminal
                            pre.body
                                code.language-shell deno /path/to/your/project/app.ts --allow-net --allow-read
                p.text--help This is the end of this tutorial.
</template>

<script>
export const resource = {
    paths: ["/tutorials/serving-static-paths"],
    meta: {
        title: "Serving Static Paths",
    }
}

export default {
    data() {
        return {
            example_code: {
                serving_static_paths: this.$app_data.example_code.tutorials.serving_static_paths,
            }
        };
    },
}
</script>
