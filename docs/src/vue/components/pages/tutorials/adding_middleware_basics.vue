<template lang="pug">
page-tutorial-default(
    :data="data"
    :custom="true"
)
    template(v-slot:custom)
        div.row
            div.col
                hr
                h2 Table Of Contents
                ul-toc(:data="data.toc")
        div.row
            div.col
                hr
                h2#before-you-get-started Before You Get Started
                ul
                    li Drash defines middleware according to the MDN: <a href="https://developer.mozilla.org/en-US/docs/Glossary/Middleware" target="_BLANK">https://developer.mozilla.org/en-US/docs/Glossary/Middleware</a>.
                    li Adding middleware to your application is useful when you want to filter requests to your resources. You can add middleware that all of your resources use, middleware that only a few resources use, and middleware that a single resource uses.
                    list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
        div.row
            div.col
                hr
                h2#folder-structure-end-state Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="data.example_code.folder_structure")
        div.row
            div.col
                hr
                h2#steps Steps
                ol
                    li Perform the initial setup of your project.
                        code-block(:data="data.example_code.folder_structure_setup")
</template>

<script>
export const resource = {
    paths: ["/tutorials/adding-middleware"],
    meta: {
        title: "Adding Middleware",
        source_code_uri: "/adding_middleware_basics"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this
                    .$app_data
                    .example_code['/docs/src/example_code/tutorials/adding_middleware_basics'],
                toc: {
                    items: [
                        "Before You Get Started",
                        "Folder Structure End State",
                        "Steps",
                    ]
                }
            }
        };
    },
}
</script>

