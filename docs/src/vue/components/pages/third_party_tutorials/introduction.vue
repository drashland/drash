<template lang="pug">
page
    div.row
        div.col
            hr
            h2-hash About The Third Party Tutorials
            p The third party tutorials assume you have read through the following tutorials:
            ul
              li Resources
              li Server
            p Drash does not manage or contribute to any of the third party modules mentioned in the third party tutorials.
    div.row
        div.col
            hr
            h2-hash Example Code
            p All tutorials have example code blocks that work if copied and pasted. This is for your convenience. Also, almost all code blocks in the tutorials can be found in the repository at <a href="https://github.com/crookse/deno-drash/tree/master/docs/src/example_code/third_party_tutorials" target="_BLANK">https://github.com/crookse/deno-drash/tree/master/docs/src/example_code/third_party_tutorials</a>.
</template>

<script>
export const resource = {
    paths: [
        "/third-party-tutorials",
        "/third-party-tutorials/introduction"
    ],
    meta: {
        title: "Third Party Tutorials: Introduction"
    }
}

export default {
    data() {
        return {};
    },
}
</script>
