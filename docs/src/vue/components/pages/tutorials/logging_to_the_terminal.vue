<template lang="pug">
page-tutorial-logging(:data="data")
    template(v-slot:steps)
        ol
            li Create your app file.
                code-block(:data="data.example_code.app")
            li Run your app.
                code-block(:data="data.example_code.run")
            li Check the terminal you used to start <code>app.ts</code>. The log messages in <code>HomeResource</code> will be written in the terminal. The other log messages are written from the <code>Drash.Http.Server</code> class.
                code-block-slotted
                    template(v-slot:title) Terminal
                    template(v-slot:code)
                        | INFO | Request received: GET /
                        | DEBUG | Calling HomeResource.GET() method.
                        | FATAL | This is a FATAL log message.
                        | ERROR | This is an ERROR log message.
                        | WARN | This is a WARN log message.
                        | INFO | This is an INFO log message.
                        | DEBUG | This is a DEBUG log message.
                        | TRACE | This is a TRACE log message.
                        | INFO | Sending response. Content-Type: application/json. Status: 200 (OK).
                        | DEBUG | /favicon.ico requested.
                        | DEBUG | All future log messages for /favicon.ico will be muted.
</template>

<script>
export const resource = {
    paths: ["/tutorials/logging-to-the-terminal"],
    meta: {
        title: "Logging: Logging To The Terminal",
        tutorial_title: "Logging To The Terminal",
        source_code_uri: "/logging/logging_to_the_terminal"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.logging_to_the_terminal
            }
        };
    },
}
</script>
