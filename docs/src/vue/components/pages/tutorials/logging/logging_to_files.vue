<template lang="pug">
page-tutorial(
  :toc="toc"
)
  div.row
    div.col
      hr
      h2-hash Before You Get Started
      p In this tutorial, you will learn how to log to the files using Drash's file logger.
      p-view-source-code(:source_code_uri="$route.meta.source_code_uri")
  div.row
    div.col
      hr
      div-folder-structure-end-state(:code_block_data="example_code.folder_structure")
  div.row
    div.col
      hr
      h2-hash Steps
      ol
        li Create your resource file.
          code-block(:data="example_code.home_resource")
          p Before your resource sets the response's body, it will write log messages.
        li Create your app file.
          code-block(:data="example_code.app" line_highlight="11-12")
          p Your server will write log messages based on the values of the highlighted code. In this tutorial, your server will write all log messages to <code>server.log</code>.
  div.row
    div.col
      hr
      h2-hash Verification
      ol
        li Run your app.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | deno --allow-net --allow-write app.ts
          p-deno-flag-allow-net
          p-deno-flag-allow-write
        li Make a request using <code>curl</code> like below or go to <code>localhost:1447/</code> in your browser.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | curl localhost:1447/
          p You should receive the following response:
          p
            code-block-slotted(language="javascript" :header="false")
              template(v-slot:code)
                | "GET request received! Also, check your server.log file to see the log messages written by this resource."
        li Check your <code>server.log</code> file. The log messages in <code>HomeResource</code> will be written.
          code-block-slotted(line_highlight="2,3,10")
            template(v-slot:title) Terminal
            template(v-slot:code)
              | 2019-12-27 17:14:55.760Z | INFO | Request received: GET /
              | 2019-12-27 17:14:55.762Z | DEBUG | [drash] Using `HomeResource` resource class to handle the request.
              | 2019-12-27 17:14:55.762Z | DEBUG | [drash] Calling GET().
              | 2019-12-27 17:14:55.762Z | FATAL | This is a FATAL log message.
              | 2019-12-27 17:14:55.762Z | ERROR | This is an ERROR log message
              | 2019-12-27 17:14:55.762Z | WARN | This is a WARN log message
              | 2019-12-27 17:14:55.762Z | INFO | This is an INFO log message
              | 2019-12-27 17:14:55.762Z | DEBUG | This is a DEBUG log message
              | 2019-12-27 17:14:55.762Z | TRACE | This is a TRACE log message
              | 2019-12-27 17:14:55.762Z | DEBUG | [drash] Sending response. 200.
          p Drash's server has debug log messages for development purposes. They are highlighted above and prefixed with <code>[drash]</code>. All development related Drash log messages are prefixed with <code>[drash]</code> to help you identify which messages are from Drash.
</template>

<script>
export const resource = {
  paths: ["/tutorials/logging/logging-to-files"],
  meta: {
    title: "Logging To Files",
    tutorial_title: "Logging To Files",
    source_code_uri: "/tutorials/logging/logging_to_files"
  }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/logging/logging_to_files'],
      toc: {
        items: [
          "Before You Get Started",
          "Folder Structure End State",
          "Steps",
          "Verification",
        ]
      }
    };
  },
}
</script>
