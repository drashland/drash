<template lang="pug">
p You can view the source code for this tutorial in the repository <a :href="source_code_url" target="_BLANK">here</a>.
</template>

<script>
export default {
    props: [
        'source_code_uri',
    ],
    computed: {
        source_code_url() {
            return "https://github.com/crookse/deno-drash/tree/master/docs/src/example_code" + this.$route.meta.source_code_uri
        }
    }
}
</script>
