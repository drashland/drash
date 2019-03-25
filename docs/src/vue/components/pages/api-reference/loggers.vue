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
                h2 Drash.Loggers
                p Below are the list of classes under this namespace:
                ul
                    li
                        a(:href="$conf.base_url + '/#/api-reference/loggers/logger'") Drash.Loggers.Logger
                    li
                        a(:href="$conf.base_url + '/#/api-reference/loggers/console-logger'") Drash.Loggers.ConsoleLogger
                    li
                        a(:href="$conf.base_url + '/#/api-reference/loggers/file-logger'") Drash.Loggers.FileLogger
</template>

<script>
export const resource = {
    paths: ["/api-reference/loggers"],
    meta: {
        title: "Loggers",
    }
}

export default {}
</script>
