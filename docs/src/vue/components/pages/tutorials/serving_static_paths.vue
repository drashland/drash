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
                        a(:href="$conf.base_url + '/#/tutorials/serving-static-paths#how-it-works'") How It Work
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
                        code-block(:data="example_code.serving_static_paths.folder_structure_setup")
                    li Create your HTTP resource class file and have it log an <code>INFO</code> message when handling a <code>GET</code> request.
                        ul
                            li This class will handle <code>GET</code> requests to the <code>/</code> URI.
                            li This class will write a log message to the terminal for every <code>GET</code> request received.
                        code-block(:data="example_code.serving_static_paths.home_resource")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                        code-block(:data="example_code.serving_static_paths.app")
                    li Run your app.
                      div.b-code-example
                            pre.header
                                code.header Terminal
                            pre.body
                                code.language-shell deno /path/to/your/project/app.ts --allow-net
                    li Make the following <code>GET</code> request:
                        code-block(:data="example_code.serving_static_paths.get_request")
                    li Check the terminal you used to start <code>app.ts</code>. The <code>INFO | Howdy! I'm handling your GET request.</code> log message from the <code>HomeResource</code> class was written to the terminal.
                        ul
                            li The other log messages are written from the <code><a href="https://github.com/crookse/deno-drash/blob/master/src/http/server.ts" target="_BLANK">Drash.Http.Server</a></code> class.
                        code-block(:data="example_code.serving_static_paths.terminal")
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
