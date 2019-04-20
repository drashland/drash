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
    .no-header {
        border-radius: 1.0875rem;
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
    pre.header(v-if="header !== false")
        code.header
            slot(name="title")
    pre.body(:data-line="line_highlight" :class="{'no-header': header === false}")
        code(:class="'language-' + language")
            slot(name="code")
</template>

<script>
export default {
    props: [
        'header',
        'line_highlight',
        'language',
    ],
    mounted() {
        Prism.highlightAll();
    }
}
</script>
