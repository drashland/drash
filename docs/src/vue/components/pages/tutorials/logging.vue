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
                h3 Before you get started
                ul
                    li If you want your Drash server to log to the console or to a file, then you must specify a logger when creating your Drash server.
                    li You can download the source code for this tutorial here.
                h3 Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="example_code.folder_structure")
                h3 Steps
                ol
                    li Perform the initial setup of your project.
                        code-block(:data="example_code.folder_structure_setup")
                    li Create your HTTP resource class file.
                        ul
                            li This class will handle <code>GET</code> requests to the <code>/</code> URI.
                            li This class will write a log message to <code>.tmp/server.log</code> for every <code>GET</code> request received.
                        code-block(:data="example_code.home_resource")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                        code-block(:data="example_code.app")
                    li Run your app.
                      div.b-code-example
                            pre.header
                                code.header Terminal
                            pre.body
                                code.language-shell deno /path/to/your/project/app.ts --allow-net
                    li Make the following <code>GET</code> and <code>POST</code> requests:
                        p.text--help I recommend using <a href="https://www.getpostman.com/" target="_BLANK">Postman</a> to make these requests. It's fast and versatile for web development.
                        ul
                            li <code>localhost:8000?response_content_type=text/html</code>
                            li <code>localhost:8000?response_content_type=application/json</code>
                            li <code>localhost:8000?response_content_type=application/pdf</code>
                            li <code>localhost:8000?response_content_type=application/xml</code>
                            li <code>localhost:8000?response_content_type=text/xml</code>
                            li <code>localhost:8000?response_content_type=text/plain</code>
                p.text--help This is the end of this tutorial.
</template>

<script>
export const resource = {
    paths: ["/tutorials/logging"],
    meta: {
        title: "Logging",
    }
}

export default {
    data() {
        return {
            example_code: this.$app_data.example_code.tutorials.logging
        };
    },
}
</script>

