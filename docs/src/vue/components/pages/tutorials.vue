<template lang="pug">
div
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 {{ $route.meta.title }}
    hr
    div.c-page__body
        div.row
            div.col
                p Below is a list of tutorials to help you develop using Drash.
                ul
                    li
                        a(:href="$conf.base_url + '/#/tutorials/adding-content-types'") Adding Content Types
                    li
                        a(:href="$conf.base_url + '/#/tutorials/handling-content-negotiation'") Handling Content Negotiation</a>
</template>

<script>
export const resource = {
    paths: ["/tutorials"],
    meta: {
        title: "Tutorials",
    }
}

export default {
    data() {
        return {
        };
    }
}
</script>

