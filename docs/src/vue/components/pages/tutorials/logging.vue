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
                        a(:href="$conf.base_url + '/#/tutorials/logging#console-logging'") Console Logging
                    li
                        a(:href="$conf.base_url + '/#/tutorials/logging#file-logging'") File Logging
        hr
        div.row
            div.col
                h2(id="file-logging") File Logging
                h3 Before you get started
                ul
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
                            li This class will write a log message to <code>/path/to/your/project/.tmp/server.log</code> for every <code>GET</code> request received.
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
                                code.language-shell deno /path/to/your/project/app.ts --allow-net --allow-write
                    li Make the following <code>GET</code> request:
                        p.text--help I recommend using <a href="https://www.getpostman.com/" target="_BLANK">Postman</a> to make these requests. It's fast and versatile for web development.
                        ul
                            li <code>localhost:8000</code>
                    li Check <code>/path/to/your/project/.tmp/server.log</code> to see the below log messages. The <code>INFO</code> log message (<code>INFO | Howdy! I'm handling your GET request.</code>) from the <code>HomeResource</code> class was written to the file.
                        code-block(:data="example_code.server_log")
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
            example_code: this.$app_data.example_code.tutorials.logging.server_logging_to_files
        };
    },
}
</script>
