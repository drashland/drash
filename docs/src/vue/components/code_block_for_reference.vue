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
<style lang="scss">
    .line-highlight {
        background: rgba(255,255,255,0.1);
        width: 100%;
    }
    .line-highlight:before {
        display: none;
    }
</style>

<template lang="pug">
div.b-code-example.code-block-for-reference
    pre.header
        code.header {{ data.filename }}
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
