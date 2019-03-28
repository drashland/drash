<style lang="scss" scoped>
    pre {
        margin-bottom: 0;
        padding: 0;
    }
    pre.body code {
        padding: 1rem;
        position: relative;
        width: 100%;
    }
    .card .code-block-for-reference .body {
        max-height: 500px;
        overflow: auto;
    }
    @media screen and (max-width: 950px) {
        .card .code-block-for-reference {
            margin-left: -1.25rem;
            margin-right: -1.25rem;
            pre {
                border-radius: 0;
            }
        }
    }
</style>

<template lang="pug">
div.b-code-example.code-block-for-reference
    pre.header
        code.header {{ data.title }}
    pre.body(:data-line="data.line_highlight")
        code(:class="'language-' + data.language") {{ data.code }}
</template>

<script>
export default {
    props: [
        'data'
    ],
    mounted() {
        Prism.highlightAll();
    }
}
</script>
