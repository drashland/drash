<template lang="pug">
page
    div.row
        div.col
            hr
            h2-hash About The Advanced Tutorials
            p The advanced tutorials assume you have read through the following tutorials:
            ul
              li Resources
              li Server
    div.row
        div.col
            hr
            h2-hash Example Code
            p All tutorials have example code blocks that work if copied and pasted. This is for your convenience. Also, almost all code blocks in the tutorials can be found in the repository at <a href="https://github.com/crookse/deno-drash/tree/master/docs/src/example_code/tutorials" target="_BLANK">https://github.com/crookse/deno-drash/tree/master/docs/src/example_code/advanced_tutorials</a>.
</template>

<script>
export const resource = {
    paths: [
        "/advanced-tutorials",
        "/advanced-tutorials/introduction"
    ],
    meta: {
        title: "Advanced Tutorials: Introduction"
    }
}

export default {
    data() {
        return {};
    },
}
</script>
