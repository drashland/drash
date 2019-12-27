<template lang="pug">
li You can download the source code for this tutorial here: <a :href="source_code_url" target="_BLANK">{{ source_code_url }}</a>.
</template>

<script>
export default {
    props: [
        'source_code_uri',
    ],
    computed: {
        source_code_url() {
            return "https://github.com/crookse/deno-drash/tree/master/docs/src/example_code" + this.source_code_uri
        }
    }
}
</script>
