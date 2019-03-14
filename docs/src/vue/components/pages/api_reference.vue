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
                    h3 Methods
                    div.card(v-for="method in classData.methods" style="margin-bottom: 2rem")
                        div.card-body
                            div.card-title
                                strong {{ method.signature }}
                            hr(style="margin: 1rem 0")
                            p(style="margin-bottom: 1rem" v-show="method.params.length > 0")
                                strong Params
                                ul
                                    li(v-for="param in method.params") {{ param.name }}
                                        ul(v-show="param.description && param.description.length > 0")
                                            li Description
                                                ul
                                                    li(v-for="description in param.description") {{ description }}
                            p(style="margin-bottom: 1rem" v-show="method.returns.length > 0")
                                strong Returns
                                ul
                                    li(v-for="ret in method.returns")
                                        div {{ ret.type }}
                                        ul(v-show="ret.description.length > 0")
                                            li(v-for="description in ret.description") {{ description }}
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

