<template lang="pug">
page
  div.row
    div.col
      hr
      h2-hash About The Tutorials
      p The tutorials in the sidebar are ordered (from top to bottom) in a way that will help you understand Drash's request-resource-response lifecycle quickly. Since all tutorials have example code of setting up and starting a server, it is not required that you read the tutorials in order. However, it is greatly recommended.
  div.row
    div.col
      hr
      h2-hash Example Code
      p All tutorials have example code blocks that work if copied and pasted. This is for your convenience. Also, almost all code blocks in the tutorials can be found in the repository at <a href="https://github.com/crookse/deno-drash/tree/master/docs/src/example_code/tutorials" target="_BLANK">https://github.com/crookse/deno-drash/tree/master/docs/src/example_code/tutorials</a>.
</template>

<script>
export const resource = {
  paths: [
    "/tutorials",
    "/tutorials/introduction"
  ],
  meta: {
    title: "Tutorials: Introduction"
  }
}

export default {
  data() {
    return {};
  },
}
</script>
