<style lang="scss" scoped>
    p {
        margin-bottom: 1rem;
    }
    .type-heading {
        margin-bottom: 2rem;
        padding: 1rem;
        &.--methods {
            background: #ff7700;
            color: #efefef;
        }
        &.--properties {
            background: #03a9f4;
            color: #efefef;
        }
    }
    .card {
        margin-bottom: 2rem;
        &.--method {
            border-left: 4px solid #ff7700;
        }
        &.--property {
            border-left: 4px solid #03a9f4;
        }
    }
    .card-title {
        font-size: 1.5rem;
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
        margin-bottom: 0;
    }
</style>

<template lang="pug">
div
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 {{ $route.meta.title }}
    hr
    div.c-page__body
        div.row(v-for="(namespaceData, namespaceName) in reference")
            div.col
                div(v-for="(classData, className) in namespaceData")
                    h2 {{ namespaceName }}.{{ className }}
                    //- CLASS PROPERTIES
                    h3.type-heading.--properties Properties
                    div.properites
                        div.card.--property(v-for="property in classData.properties" v-if="classData.properties.length > 0")
                            div.card-body
                                div.card-title
                                    strong {{ property.signature }}
                                hr(style="margin: 1rem 0")
                                //- DESCRIPTIONS
                                div.tag-row(v-show="property.description.length > 0")
                                    strong.tag-row__heading Description
                                    ul
                                        li(v-for="description in property.description" :inner-html.prop="description | markdown-it")
                                //- TYPE
                                div.tag-row(v-show="property.type")
                                    strong.tag-row__heading Type
                                    ul
                                        li.font-style--italic {{ property.type }}
                                //- EXAMPLE CODE
                                div.tag-row(v-show="property.example_code.length > 0")
                                    strong.tag-row__heading Example Usage
                                    ul
                                        li See the highlighted line(s) below.
                                    code-block-for-reference(v-for="example_code, index in property.example_code" :key="index" :data="example_code")
                        div.card(v-else)
                            div.card-body
                                div.tag-row
                                    p This class doesn't have any properties.
                    //- CLASS METHODS
                    h3.type-heading.--methods Methods
                    div.methods
                        div.card.--method(v-for="method in classData.methods" v-if="classData.methods.length > 0")
                            div.card-body
                                div.card-title
                                    strong {{ method.signature }}
                                hr(style="margin: 1rem 0")
                                //- DESCRIPTIONS
                                div.tag-row(v-show="method.description.length > 0")
                                    strong.tag-row__heading Description
                                    ul
                                        li(v-for="description in method.description" :inner-html.prop="description | markdown-it")
                                div.tag-row(v-show="method.params.length > 0")
                                    strong.tag-row__heading Params
                                    ul
                                        li(v-for="param in method.params") <strong>{{ param.name }}:</strong> <span class="font-style--italic">{{ param.type }}</span>
                                            ul(v-show="param.description && param.description.length > 0")
                                                li(v-for="description in param.description" :inner-html.prop="description | markdown-it")
                                div.tag-row(v-show="method.returns.length > 0")
                                    strong.tag-row__heading Returns
                                    ul
                                        li(v-for="ret in method.returns")
                                            div.font-style--italic {{ ret.type }}
                                            ul(v-show="ret.description.length > 0")
                                                li(v-for="description in ret.description" :inner-html.prop="description | markdown-it")
                                //- EXAMPLE CODE
                                div.tag-row(v-show="method.example_code.length > 0")
                                    strong.tag-row__heading Example Usage
                                    ul
                                        li See the highlighted line(s) below.
                                    code-block-for-reference(v-for="example_code, index in method.example_code" :key="index" :data="example_code")
                        div.card(v-else)
                            div.card-body
                                div.tag-row
                                    p This class doesn't have any methods.
</template>

<script>
import apiReferenceData from "/src/api_reference.json";

export const resource = {
    paths: ["/api-reference"],
    meta: {
        title: "API Reference",
    }
}

export default {
    data() {
        return {
            reference: apiReferenceData
        };
    },
}
</script>

