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
                h2 Drash.Http
                p Below are the list of classes under this namespace:
                ul
                    li
                        a(:href="$conf.base_url + '/#/api-reference/http/resource'") Drash.Http.Resource
                    li
                        a(:href="$conf.base_url + '/#/api-reference/http/response'") Drash.Http.Response
                    li
                        a(:href="$conf.base_url + '/#/api-reference/http/server'") Drash.Http.Server
</template>

<script>
export const resource = {
    paths: ["/api-reference/http"],
    meta: {
        title: "Http",
    }
}

export default {}
</script>
