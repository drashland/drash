<template lang="pug">
page-tutorial-logging(:data="data")
    template(v-slot:steps)
        ol
            li Create your app file.
                code-block(:data="data.example_code.app")
            li Run your app.
                code-block(:data="data.example_code.run")
            li Check the terminal you used to start <code>app.ts</code>. The log messages in <code>HomeResource</code> will be written in the terminal. The other log messages come from the <code>Drash.Http.Server</code> class.
                code-block-slotted
                    template(v-slot:title) /path/to/your/project/server.log
                    template(v-slot:code)
                        | 2019-04-20 02:54:13.467Z | INFO |  Request received: GET /
                        | 2019-04-20 02:54:13.468Z | DEBUG |  Calling HomeResource.GET() method.
                        | 2019-04-20 02:54:13.468Z | FATAL |  This is a FATAL log message.
                        | 2019-04-20 02:54:13.468Z | ERROR |  This is an ERROR log message
                        | 2019-04-20 02:54:13.468Z | WARN |  This is a WARN log message
                        | 2019-04-20 02:54:13.468Z | INFO |  This is an INFO log message
                        | 2019-04-20 02:54:13.468Z | DEBUG |  This is a DEBUG log message
                        | 2019-04-20 02:54:13.468Z | TRACE |  This is a TRACE log message
                        | 2019-04-20 02:54:13.468Z | INFO |  Sending response. Content-Type: application/json. Status: 200 (OK).
                        | 2019-04-20 02:54:13.485Z | DEBUG |  /favicon.ico requested.
                        | 2019-04-20 02:54:13.485Z | DEBUG |  All future log messages for /favicon.ico will be muted.
    template(v-slot:what-is-the-code-doing)
        h3 <code>app.ts</code>
        ol
            li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
            li A resource class named <code>HomeResource</code> is created.
                ul
                    li The path (a.k.a. URI) that <code>HomeResource</code> opens up to clients is <code>/</code> (in the <code>static paths</code> property). This means clients can only access <code>HomeResource</code> through the <code>/</code> URI.
                    li <code>HomeResource</code> contains a <code>GET()</code> method. This method will handle all <code>GET</code> requests to <code>HomeResource</code>. When a client makes a <code>GET</code> request to <code>HomeResource</code>, log messages will be written to the <code>server.log</code> file.
            li The Drash server is created.
                ul
                    li The address for the server is set to <code>localhost:1337</code>. This means the full address to <code>HomeResource</code> is <code>localhost:1337/</code>.
                    li The default response output is set to <code>application/json</code>. This means all responses from the server will default to the <code>application/json</code> MIME type. By default, Drash servers can handle the following types: <code>text/html</code>, <code>application/json</code>, <code>application/xml</code>, and <code>text/xml</code>. Drash servers can handle more content types, but you have to add that code. Read <a :href="$conf.base_url + '/#/tutorials/adding-content-types'">Adding Content Types</a> for more information.
                    li The Drash server is given one resource: <code>HomeResource</code>.
                    li The server's <code>logger</code> config is used to add a <code>Drash.Loggers.FileLogger</code> object.
                        ul
                            li The logger is set to be enabled (this option exists so that message output can be turned off during unit tests) when the server runs; and the logger's log message level is <code>all</code>. This means all log messages will be displayed.
                            li The logger is set to write to <code>./server.log</code>.
                            li The logger's <code>tag_string</code> config is used to define a tag string that is prepended to the log message. All tags must be surrounded by the left <code>{</code> and the right <code>}</code>.
                            li Each tag is mapped to a member in the logger's <code>tag_string_fns</code> config. For example, the <code>{datetime}</code> tag will get its data using the <code>datetime()</code> function. The <code>{level}</code> tag is a reserved tag and will always output the level of the current log message being written to the log. If a tag is defined in the <code>tag_string</code> config and can't be mapped to a member in the <code>tag_string_fns</code> config, then the tag will show as its written.
            li The Drash server's <code>run()</code> method is invoked so that when <code>app.ts</code> is passed to the <code>deno</code> command in the terminal, the Drash server is started.
        h3 <code>deno</code> (in the terminal)
        ol
            li Deno runs <code>app.ts</code> and:
                ol
                    li Allows network access via <code>--allow-net</code> flag.
                    li Allows environment access via <code>--allow-env</code> flag.
                    li Allows write access via <code>--allow-write</code> flag.
                p The <code>--allow-net</code> flag is added so that the server will work.
                p The <code>--allow-env</code> flag is added because <code>Drash.Http.Response</code> objects require environment access if they're setup to serve static paths. Serving static paths isn't setup in this tutorial, but the <code>Drash.Http.Response</code> class compiles with the code that requires access to the environment. This means the <code>--allow-env</code> flag is always required.
                p The <code>--allow-write</code> flag is added to allow writing log messages to the <code>server.log</code> file.
</template>

<script>
export const resource = {
    paths: ["/tutorials/logging-to-files"],
    meta: {
        title: "Logging: Logging To Files",
        tutorial_title: "Logging To Files",
        source_code_uri: "/logging/logging_to_files"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.logging_to_files
            }
        };
    },
}
</script>
