<template lang="pug">
div.page.page--reference
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 {{ data.class.fully_qualified_name }}
    div.c-page__body
        hr
        div.row
            div.col
                //- CLASS PROPERTIES
                h2.type-heading.--properties Properties
                div.properites
                    div.card.--property(v-for="property in data.class.properties" v-show="hasProperties(data.class.properties)")
                        div.card-body
                            div.card-title
                                code.c-code-signature.language-typescript {{ property.signature }}
                            hr(style="margin: 1rem 0")
                            //- DESCRIPTIONS
                            div.tag-row(v-show="property.description.length > 0")
                                strong.tag-row__heading Description
                                ul
                                    li(v-for="description in property.description" :inner-html.prop="description | markdown-it")
                            //- TYPE
                            div.tag-row(v-show="property.data_type")
                                strong.tag-row__heading Type
                                ul
                                    li
                                        code.c-code-data-type {{ property.data_type }}
                            //- EXAMPLE CODE
                            div.tag-row(v-show="property.example_code.length > 0")
                                strong.tag-row__heading Example Usage
                                ul
                                    li See the highlighted line(s) below.
                                code-block-for-reference(v-for="example_code, index in property.example_code" :key="index" :data="example_code")
                    div.card(v-show="!hasProperties(data.class.properties)")
                        div.card-body
                            div.tag-row
                                p This class doesn't have any properties.
        hr
        div.row
            div.col
                //- CLASS METHODS
                h2.type-heading.--methods Methods
                div.methods
                    div.card.--method(v-for="method in data.class.methods" v-if="data.class.methods.length > 0")
                        div.card-body
                            div.card-title
                                code.c-code-signature.language-typescript {{ method.signature }}
                            hr(style="margin: 1rem 0")
                            //- DESCRIPTIONS
                            div.tag-row(v-show="method.description.length > 0")
                                strong.tag-row__heading Description
                                ul
                                    li(v-for="description in method.description" :inner-html.prop="description | markdown-it")
                            div.tag-row(v-show="method.params.length > 0")
                                strong.tag-row__heading Params
                                ul
                                    li(v-for="param in method.params")
                                        code.c-code-parameter {{ param.name }}
                                        span : 
                                        code.c-code-data-type {{ param.data_type }}
                                        ul(v-show="param.description.length > 0")
                                            li(v-for="description in param.description" :inner-html.prop="description | markdown-it")
                            div.tag-row(v-show="method.returns.length > 0")
                                strong.tag-row__heading Returns
                                ul
                                    li(v-for="ret in method.returns")
                                        code.c-code-data-type {{ ret.data_type }}
                                        ul(v-show="ret.description.length > 0")
                                            li(v-for="description in ret.description" :inner-html.prop="description | markdown-it")
                            //- EXAMPLE CODE
                            div.tag-row(v-show="method.example_code.length > 0")
                                strong.tag-row__heading Example Code
                                code-block-for-reference(v-for="example_code, index in method.example_code" :key="index" :data="example_code")
                    div.card(v-else)
                        div.card-body
                            div.tag-row
                                p This class doesn't have any methods.
</template>

<script>
export default {
    props: [
        'data'
    ],
    methods: {
        hasProperties(properties) {
            return properties && properties.length > 0;
        }
    }
}
</script>
