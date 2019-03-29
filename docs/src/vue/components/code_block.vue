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
        .code-block-default {
            margin-left: -1.25rem;
            margin-right: -1.25rem;
            pre {
                border-radius: 0;
            }
        }
    }
</style>

<template lang="pug">
div.b-code-example.code-block-default
    pre.header
        code.header {{ data.title }}
    pre.body(:data-line="data.line_highlight")
        code(:class="'language-' + data.language") {{ data.contents }}
</template>

<script>
export default {
    props: [
        'data',
        'title',
        'line_highlight',
    ],
    beforeMount() {
        if (this.title) {
            this.data.title = this.title;
        }
        if (this.line_highlight) {
            this.data.line_highlight = this.line_highlight;
        }
    },
    mounted() {
        Prism.highlightAll();
    }
}
</script>
