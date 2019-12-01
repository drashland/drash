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
                    li Drash defines resources according to the MDN: <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web" target="_BLANK">https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web</a>
                    li Unlike most other frameworks, Drash uses resource classes to handle requests and send responses. So, instead of controllers being mapped to routes (a.k.a paths), you have resource classes that define their own paths that requests can target.
                    li Drash servers take resource classes and register their paths as accessible URIs. An accessible URI is a URI that a client can target. Any URI that does not exist in any resource is a non-accessible URI. Non-accessible URIs ultimately lead to a response other than a <code>200 OK</code> repsonse. The default response for a request to a non-accessible URI is a <code>404 Not Found</code> error.
                    list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
        div.row
            div.col
                hr
                h2#creating-a-resource-that-handles-get-and-post-requests Creating A Resource That Handles <code>GET</code> And <code>POST</code> Requests
                p This resource handles requests at the <code>/</code> URI. If a client makes a request to this URI, this resource would handle that request.
                code-block(:data="data.example_code.my_resource_get_post")
        div.row
            div.col
                hr
                h2#creating-a-resource-that-handles-get-post-put-and-delete-requests Creating A Resource That Handles <code>GET</code>, <code>POST</code>, <code>PUT</code>, And <code>DELETE</code> Requests
                p This resource handles requests at the <code>/</code> URI. If a client makes a request to this URI, this resource would handle that request.
                p As you can see, the HTTP methods you add and make public in a resource are the HTTP methods clients are allowed to call. If a client tries to make a <code>PATCH</code> request to this resource, it would receive a <code>405 Method Not Allowed</code> error as a response because this resource does not have <code>public PATCH() { ... }</code> defined.
                code-block(:data="data.example_code.my_resource_get_post_put_delete")
        div.row
            div.col
                hr
                h2#creating-a-resource-that-handles-request-params Creating A Resource That Handles Request Params
                p This resource checks for the request's path params, URL query params, and body params (if any) at the <code>/</code> and <code>/:something_cool</code> URIs. If a client makes a request to these URIs, this resource would handle that request.
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
                example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/creating_a_resource'],
                toc: {
                    items: [
                        "Before You Get Started",
                        "Creating A Resource That Handles GET And POST Requests",
                        "Creating A Resource That Handles GET, POST, PUT, And DELETE Requests",
                        "Creating A Resource That Handles Request Params",
                    ]
                }
            }
        };
    },
}
</script>

