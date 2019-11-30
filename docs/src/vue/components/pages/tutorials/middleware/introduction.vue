<template lang="pug">
page
    div.row
        div.col
            hr
            h2 Table Of Contents
            ul-toc(:data="data.toc")
    div.row
        div.col
            hr
            h2#basics Basics
            p Drash defines middleware according to the MDN: <a href="https://developer.mozilla.org/en-US/docs/Glossary/Middleware" target="_BLANK">https://developer.mozilla.org/en-US/docs/Glossary/Middleware</a>.
            p Adding middleware to your application is useful when you want to filter requests throughout the request-resource-response lifecycle.
    div.row
        div.col
            hr
            h2#types Types
            p There are two types of middleware in Drash:
            ul
                li
                    strong Server-level middleware
                    p Middleware that is executed by the server on every request.
                li
                    strong Resource-level middleware
                    p Middleware that can only be executed by resources. That is, if a resource specifies a list of middleware in its <code>middleware</code> property, then that middleware will be executed.
    div.row
        div.col
            hr
            h2#sorting Sorting
            p Middleware is executed in the order you define them. Take the example below.
            p
                code-block-slotted(:header="false" language="typescript")
                    template(v-slot:code) {{ data.example_code.sorting.contents }}
            p The server-level middleware would execute in the following order:
            ul
                li <code>OneMiddleware</code>
                li <code>TwoMiddleware</code>
            p The resource-level middleware would execute in the following order:
            ul
                li <code>RedMiddleware</code>
                li <code>BlueMiddleware</code>
</template>

<script>
export const resource = {
    paths: [
        "/tutorials/middleware/introduction"
    ],
    meta: {
        title: "Introduction To Middleware",
        source_code_uri: "/middleware/introduction"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this
                    .$app_data
                    .example_code['/docs/src/example_code/tutorials/middleware/introduction'],
                toc: {
                    items: [
                        "Basics",
                        "Types",
                        "Sorting",
                    ]
                }
            }
        };
    },
}
</script>
