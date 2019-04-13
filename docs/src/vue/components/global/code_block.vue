<style lang="scss">
    .line-highlight:after {
        display: none;
    }
</style>

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
            margin-left: -2rem;
            margin-right: -2rem;
            pre {
                border-radius: 0;
            }
        }
        li .code-block-default {
            margin-left: -4.75rem;
            margin-right: -2rem;
        }
    }
</style>

<template lang="pug">
div.b-code-example.code-block-default
    pre.header
        code.header {{ data.title ? data.title : "(no title)" }}
    pre.body(:data-line="data.line_highlight")
        code(:class="'language-' + data.language") {{ data.contents ? data.contents : "(contents could not be loaded)" }}
</template>

<script>
export default {
    props: [
        'data',
        'title',
        'line_highlight',
        'language',
    ],
    beforeMount() {
        if (this.title) {
            this.data.title = this.title;
        }
        if (this.line_highlight) {
            this.data.line_highlight = this.line_highlight;
        }
        if (this.language) {
            this.data.language = this.language;
        }
        this.data.contents = this.data.contents.replace(/<\/\/script>/g, "<\/script>");
    },
    mounted() {
        Prism.highlightAll();
    }
}
</script>
