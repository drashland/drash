<style lang="scss">
$g-font-family-code: SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
.page--reference {
    p {
        margin-bottom: 1rem;
    }
    .type-heading {
        margin-bottom: 2rem;
        padding: 1rem;
        &.--class {
            color: #efefef;
            background: #000;
        }
        &.--methods {
            // border-bottom: 4px solid #ff7700;
            color: #efefef;
            background: #ff7700;
            padding: 0.5rem 1rem;
        }
        &.--properties {
            color: #efefef;
            background: #03a9f4;
            padding: 0.5rem 1rem;
            // border-bottom: 4px solid #03a9f4;
        }
    }
    .card {
        margin-bottom: 2rem;
        &.--method {
            border-left: 10px solid #ff7700;
        }
        &.--property {
            border-left: 10px solid #03a9f4;
        }
    }
    .card-title {
        font-size: 1.2rem;
    }
    .tag-row {
        margin-bottom: 1rem;
        &:last-of-type {
            margin-bottom: 0;
        }
    }
    .tag-row__heading {
        display: block;
        margin-bottom: 1rem;
    }
    .tag-row p:last-of-type {
        margin-bottom: 0;
    }
    .tag-row ul {
        margin-top: 0;
    }
    .tag-row ul li ul,
    .tag-row ul ul {
        margin-top: 1rem;
        margin-bottom: 0;
    }
}
</style>

<template lang="pug">
div.page.page--reference
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 API Reference
    div.c-page__body
        hr
        div.row
            div.col
                h2 {{ data.class.fully_qualified_name }}
                p
                    a(:href="'https://github.com/crookse/deno-drash/tree/master' + link" target="_BLANK" v-if="link") View raw code
                p(v-for="description in  data.class.description" :inner-html.prop="description | markdown-it")
        hr
        div.row
            div.col
                //- CLASS PROPERTIES
                h2.type-heading.--properties Dictionary Information
                div.properites
                    div.card.--property
                        div.card-body
                            //- DESCRIPTIONS
                            div.tag-row(v-show="data.class.description && data.class.description.length > 0")
                                strong.tag-row__heading Description
                                ul
                                    li(v-for="description in data.class.description" :inner-html.prop="description | markdown-it")
</template>

<script>
export default {
    props: [
        'data',
        'link'
    ],
    data() {
        return {
            raw_code_data: ""
        };
    },
    watch: {
        raw_code_data() {
            setTimeout(function() {
                Prism.highlightAll();
            }, 2000);
        }
    },
    methods: {
        empty(inputObj) {
            return !inputObj || Object.keys(inputObj).length <= 0;
        }
    }
}
</script>
