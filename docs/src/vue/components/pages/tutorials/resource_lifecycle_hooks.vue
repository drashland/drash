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
                    list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
        div.row
            div.col
                hr
                h2#hooking-before-the-request Hooking Before The Request
                p Hooking before the request is useful when you want to perform actions before the specified request is made. For example, if a client makes a <code>GET</code> request, you can hook into the <code>hook_beforeRequest()</code> method of the requested resource to perform actions before the resource's <code>GET()</code> method is called.
                p The <code>hook_beforeRequest()</code> method goes in the resource class:
                code-block(:data="data.example_code.hook_before_request" title="my_resource.ts")
        div.row
            div.col
                hr
                h2#hooking-after-the-request Hooking After The Request
                p Hooking after the request is useful when you want to perform actions immediately after the specified request is made. For example, if a client makes a <code>GET</code> request, you can hook into the <code>hook_afterRequest()</code> method of the requested resource to perform actions immediatley after the resource's <code>GET()</code> method is called.
                p The <code>hook_afterRequest()</code> method goes in the resource class:
                code-block(:data="data.example_code.hook_after_request" title="my_resource.ts")
</template>

<script>
export const resource = {
    paths: ["/tutorials/resource-lifecycle-hooks"],
    meta: {
        title: "Resource Lifecycle Hooks",
        source_code_uri: "/resource_lifecycle_hooks"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/resource_lifecycle_hooks'],
                toc: {
                    items: [
                        "Before You Get Started",
                        //"Lifecycle Diagram",
                        "Hooking Before The Request",
                        "Hooking After The Request",
                    ]
                }
            }
        };
    },
}
</script>

