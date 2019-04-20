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
                    li Drash servers use HTTP resource classes to handle requests and send responses.
                    li Drash servers take HTTP resource classes and register their paths as accessible URIs. Read <a :href="$conf.base_url + '/#/tutorials/creating-a-server'">Creating A Server</a> to see how a Drash server and an HTTP resource class are used in unison.
                    li Drash defines HTTP resources according to the MDN: <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web" target="_BLANK">https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web</a>
                    list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
        div.row
            div.col
                hr
                h2#creating-a-resource Creating A Resource
                ul
                    li A resource class that can handle <code>GET</code> and <code>POST</code> requests.
                        code-block(:data="data.example_code.my_resource_get_post")
                    li A resource class that can handle <code>GET</code>, <code>POST</code>, <code>PUT</code>, and <code>DELETE</code> requests.
                        code-block(:data="data.example_code.my_resource_get_post_put_delete")
                    li A resource class that checks for the request's path params, URL query params, and body params.
                        code-block(:data="data.example_code.my_resource_handles_params")
</template>

<script>
export const resource = {
    paths: ["/tutorials/creating-a-resource"],
    meta: {
        title: "Creating A Resource",
        source_code_uri: "/creating_a_resource"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.creating_a_resource,
                toc: {
                    items: [
                        "Before You Get Started",
                        "Creating A Resource",
                    ]
                }
            }
        };
    },
}
</script>

