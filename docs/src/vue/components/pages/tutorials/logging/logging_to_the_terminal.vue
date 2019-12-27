<template lang="pug">
page-tutorial(
  :toc="toc"
)
  div.row
    div.col
      hr
      h2-hash Before You Get Started
      list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
  div.row
    div.col
      hr
      h2-hash Steps
      ol
        li Create your app file.
          code-block(:data="example_code.app")
        li Run your app.
          code-block(:data="example_code.run")
        li Check the terminal you used to start <code>app.ts</code>. The log messages in <code>HomeResource</code> will be written in the terminal. The other log messages come from the <code>Drash.Http.Server</code> class.
          code-block-slotted
            template(v-slot:title) Terminal
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
</template>

<script>
export const resource = {
  paths: ["/tutorials/logging/logging-to-the-terminal"],
  meta: {
    title: "Logging: Logging To The Terminal",
    tutorial_title: "Logging To The Terminal",
    source_code_uri: "/tutorials/logging/logging_to_the_terminal"
  },
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/logging/logging_to_the_terminal'],
      toc: {
        items: [
          "Before You Get Started",
          "Steps",
          "Verification",
        ]
      }
    };
  },
}
</script>
