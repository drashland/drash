<style lang="scss">
$g-font-family-code: SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
.page--reference {
    p {
        margin-bottom: 1rem;
    }
    .heading-class-name {
        background: #000;
        color: #efefef;
        font-family: $g-font-family-code;
        padding: rem(1);
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
                h2.type-heading.--properties Properties
                div.properites
                    div.card.--property(v-for="(property, name) in data.class.properties" v-show="!empty(data.class.properties)")
                        div.card-body
                            div.card-title
                                code.c-code-signature.language-typescript {{ property.signature }}
                            hr(style="margin: 1rem 0")
                            //- DESCRIPTIONS
                            div.tag-row(v-show="property.description && property.description.length > 0")
                                strong.tag-row__heading Description
                                ul
                                    li(v-for="description in property.description" :inner-html.prop="description | markdown-it")
                            //- TYPE
                            div.tag-row(v-show="property.data_type")
                                strong.tag-row__heading Type
                                ul
                                    li
                                        code.c-code-data-type {{ property.data_type }}
                    div.card(v-show="empty(data.class.properties)")
                        div.card-body
                            div.tag-row
                                p This class doesn't have any properties.
        hr
        div.row
            div.col
                //- CLASS METHODS
                h2.type-heading.--methods Methods
                div.methods
                    div.card.--method(v-for="(method, methodName) in data.class.methods" v-show="!empty(data.class.methods)")
                        div.card-body
                            div.card-title
                                code.c-code-signature.language-typescript {{ method.signature }}
                            hr(style="margin: 1rem 0")
                            //- DESCRIPTIONS
                            div.tag-row(v-show="method.description && method.description.length > 0")
                                strong.tag-row__heading Description
                                ul
                                    li(v-for="description in method.description" :inner-html.prop="description | markdown-it")
                            div.tag-row(v-show="!empty(method.params)")
                                strong.tag-row__heading Params
                                ul
                                    li(v-for="(param, paramname) in method.params")
                                        code.c-code-parameter {{ param.name }}
                                        span : 
                                        code.c-code-data-type {{ param.annotation.data_type }}
                                        ul(v-show="param.description && param.description.length > 0")
                                            li(v-for="description in param.description" :inner-html.prop="description | markdown-it")
                            div.tag-row(v-show="method.returns && method.returns.length > 0")
                                strong.tag-row__heading Returns
                                ul
                                    li(v-for="ret in method.returns")
                                        code.c-code-data-type {{ ret.annotation.data_type }}
                                        ul(v-show="ret.description && ret.description.length > 0")
                                            li(v-for="description in ret.description" :inner-html.prop="description | markdown-it")
                            div.tag-row(v-show="method.throws && method.throws.length > 0")
                                strong.tag-row__heading Throws
                                ul
                                    li(v-for="ret in method.throws")
                                        code.c-code-data-type {{ ret.annotation.data_type }}
                                        ul(v-show="ret.description && ret.description.length > 0")
                                            li(v-for="description in ret.description" :inner-html.prop="description | markdown-it")
                    div.card(v-show="empty(data.class.methods)")
                        div.card-body
                            div.tag-row
                                p This class doesn't have any methods.
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
    mounted() {
        Prism.highlightAll();
    },
    methods: {
        empty(inputObj) {
            return !inputObj || Object.keys(inputObj).length <= 0;
        }
    }
}
</script>
