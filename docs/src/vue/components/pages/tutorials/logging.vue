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
                        a(:href="$conf.base_url + '/#/tutorials/logging#server-logging-to-the-terminal'") Server Logging To The Terminal
                    li
                        a(:href="$conf.base_url + '/#/tutorials/logging#server-logging-to-files'") Server Logging To Files
        hr
        div.row
            div.col
                h2(id="server-logging-to-the-terminal") Server Logging To The Terminal
                h3 Before you get started
                ul
                    li You can download the source code for this tutorial here.
                h3 Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="example_code.server_logging_to_the_terminal.folder_structure")
                h3 Steps
                ol
                    li Perform the initial setup of your project.
                        code-block(:data="example_code.server_logging_to_the_terminal.folder_structure_setup")
                    li Create your HTTP resource class file and have it log an <code>INFO</code> message when handling a <code>GET</code> request.
                        ul
                            li This class will handle <code>GET</code> requests to the <code>/</code> URI.
                            li This class will write a log message to the terminal for every <code>GET</code> request received.
                        code-block(:data="example_code.server_logging_to_the_terminal.home_resource")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                        code-block(:data="example_code.server_logging_to_the_terminal.app")
                    li Run your app.
                      div.b-code-example
                            pre.header
                                code.header Terminal
                            pre.body
                                code.language-shell deno /path/to/your/project/app.ts --allow-net
                    li Make the following <code>GET</code> request:
                        code-block(:data="example_code.server_logging_to_the_terminal.get_request")
                    li Check the terminal you used to start <code>app.ts</code>. The <code>INFO | Howdy! I'm handling your GET request.</code> log message from the <code>HomeResource</code> class was written to the terminal.
                        ul
                            li The other log messages are written from the <code><a href="https://github.com/crookse/deno-drash/blob/master/src/http/server.ts" target="_BLANK">Drash.Http.Server</a></code> class.
                        code-block(:data="example_code.server_logging_to_the_terminal.terminal")
                p.text--help This is the end of this tutorial.
        hr
        div.row
            div.col
                h2(id="server-logging-to-files") Server Logging To Files
                h3 Before you get started
                ul
                    li You can download the source code for this tutorial here.
                h3 Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="example_code.server_logging_to_files.folder_structure")
                h3 Steps
                ol
                    li Perform the initial setup of your project.
                        code-block(:data="example_code.server_logging_to_files.folder_structure_setup")
                    li Create your HTTP resource class file and have it log an <code>INFO</code> message when handling a <code>GET</code> request.
                        ul
                            li This class will handle <code>GET</code> requests to the <code>/</code> URI.
                            li This class will write a log message to <code>/path/to/your/project/.tmp/server.log</code> for every <code>GET</code> request received.
                        code-block(:data="example_code.server_logging_to_files.home_resource")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                        code-block(:data="example_code.server_logging_to_files.app")
                    li Run your app.
                      div.b-code-example
                            pre.header
                                code.header Terminal
                            pre.body
                                code.language-shell deno /path/to/your/project/app.ts --allow-net --allow-write
                    li Make the following <code>GET</code> request:
                        code-block(:data="example_code.server_logging_to_files.get_request")
                    li Check <code>/path/to/your/project/.tmp/server.log</code> to see the below log messages. The <code>INFO | Howdy! I'm handling your GET request.</code> log message from the <code>HomeResource</code> class was written to the file.
                        ul
                            li The other log messages are written from the <code><a href="https://github.com/crookse/deno-drash/blob/master/src/http/server.ts" target="_BLANK">Drash.Http.Server</a></code> class.
                        code-block(:data="example_code.server_logging_to_files.server_log")
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
            example_code: {
                server_logging_to_the_terminal: this.$app_data.example_code.tutorials.logging.server_logging_to_the_terminal,
                server_logging_to_files: this.$app_data.example_code.tutorials.logging.server_logging_to_files
            }
        };
    },
}
</script>
