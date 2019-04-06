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
                h2 Drash.Exceptions
                p Below are the list of classes under this namespace:
                ul
                    li
                        a(:href="$conf.base_url + '/#/api-reference/exceptions/http-exception'") Drash.Exceptions.HttpException
</template>

<script>
export const resource = {
    paths: ["/api-reference/exceptions"],
    meta: {
        title: "Exceptions",
    }
}

export default {}
</script>
