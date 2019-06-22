<template lang="pug">
page-creating-an-app-hello-world(:data="data")
    template(v-slot:steps)
        ol
            li Enable logging by setting the server's <code>logger</code> config. The highlighted code is what's added to <code>app.ts</code>.
                code-block(:data="data.example_code.app" line_highlight="36-45")
            li Run your app.
                code-block(:data="data.example_code.run")
                p When you start your app, the logs should look like the following in the terminal:
                code-block(:data="data.example_code.output_get")
            li When you make a POST request (by clicking the POST button in the UI), the logs should look like the following (the highlighted messages are appended):
                code-block(:data="data.example_code.output_post", line_highlight="8-10")
    template(v-slot:what-is-the-code-doing)
        h3 <code>app.ts</code>
        ol
            li The server's <code>logger</code> config is used to add a <code>Drash.Loggers.ConsoleLogger</code> object.
            li The logger is set to be enabled (this option exists so that message output can be turned off during unit tests) when the server runs; and the logger's log message level is <code>debug</code>. This means all log messages with a rank equal to or less than the rank of the <code>debug</code> level will be displayed. See the following for the log message dictionary: <a href="https://github.com/crookse/deno-drash/blob/master/src/dictionaries/log_levels.ts" target="_BLANK">https://github.com/crookse/deno-drash/blob/master/src/dictionaries/log_levels.ts</a>.
            li The logger's <code>tag_string</code> config is used to define a tag string that is prepended to the log message. All tags must be surrounded by the left <code>{</code> and the right <code>}</code>.
            li Each tag is mapped to a member in the logger's <code>tag_string_fns</code> config. For example, the <code>{datetime}</code> tag will get its data using the <code>datetime()</code> function. The <code>{level}</code> tag is a reserved tag and will always output the level of the current log message being written to the log. If a tag is defined in the <code>tag_string</code> config and can't be mapped to a member in the <code>tag_string_fns</code> config, then the tag will show as its written.
        h3 <code>deno</code> (in the terminal)
        ol
            li Deno runs <code>app.ts</code> as it did in the previous tutorial.
</template>

<script>
export const resource = {
    paths: ["/tutorials/creating-an-app-hello-world-part-4"],
    meta: {
        title: "Creating An App: Hello World Part 4 of 4: Logging",
        tutorial_title: "Part 4 of 4: Logging",
        source_code_uri: "/creating_an_app_hello_world_part_4"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/creating_an_app_hello_world_part_4'],
                hide_snapshot: true
            }
        };
    },
}
</script>
