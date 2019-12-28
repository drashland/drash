<script>
export const resource = {
  paths: ["/tutorials/logging/logging-using-log-from-deno-std"],
  meta: {
    title: "Logging Using Log From deno_std",
    source_code_uri: "/tutorials/logging/logging_using_log_from_deno_std"
  }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/logging/logging_using_log_from_deno_std'],
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

<template lang="pug">
page-tutorial(
  :toc="toc"
)
  div.row
    div.col
      hr
      h2-hash Before You Get Started
      p <a href="https://github.com/denoland/deno_std" target="_BLANK">deno_std</a> has a <a href="https://github.com/denoland/deno_std/tree/master/log" target="_BLANK">Log</a> module that is readily available and you can use it as your logger of choice.
      p Drash uses deno_std v{{ $conf.deno_std_version }}.
      p-view-source-code(:source_code_uri="$route.meta.source_code_uri")
  div.row
    div.col
      hr
      h2-hash Steps
      ol
        li Create your resource file.
          code-block(:data="example_code.home_resource")
          p Your resource file will load in the log module and use it to write a log message before setting the response's body.
        li Create your app file.
          code-block(:data="example_code.app")
  div.row
    div.col
      hr
      h2-hash Verification
      ol
        li Run your app.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | deno --allow-net app.ts
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
                | "Hello!"
        li Check the terminal you used to start <code>app.ts</code>. The log message in <code>HomeResource</code> will be displayed.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | INFO Setting a response.
</template>
