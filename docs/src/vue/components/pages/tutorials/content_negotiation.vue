<template lang="pug">
page-tutorial-default(:data="data" :hide_screenshot="true")
    template(#table-of-contents)
        ul-toc(:data="data.toc")
    template(#before-you-get-started)
        ul
            li A Drash server can handle sending responses of different content types, but it is up to the resource classes to handle how their different representations are formatted.
            li Requesting different representations of a resource requires the client to explicitly ask what content type&mdash;using a correct <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types" target="_BLANK">MIME type</a> name&mdash;it wants to receive:
                ul
                    li via URL query params: 
                        code ?response_content_type=application/json
                    li via HTTP request body: 
                        code { response_content_type: "application/json" }
                    li via HTTP request headers: 
                        code { "Response-Content-Type": "application/json" }
            li If the client doesn't explicitly ask what content type it wants to receive, then the Drash server will use the default response output that was specified when it was created. Example below:
                p
                    code let server = new Drash.Http.Server({ response_output: "text/html" });
                p If a default response output wasn't specified, then the Drash server will use <code>application/json</code>.
            list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
    template(#steps)
        ol
            li Create your HTTP resource class file.
                code-block(:data="data.example_code.users_resource")
            li Create your <code>Response</code> class so your Drash server can handle HTML with Tailwind CSS and JSON with some RESTish fields.
                code-block(:data="data.example_code.response")
            li Create your app file.
                ul
                    li This is the file that will be passed to the <code>deno</code> command in the terminal.
                code-block(:data="data.example_code.app")
            li Run your app.
                code-block(:data="data.example_code.run")
            li Make the following <code>GET</code> requests:
                code-block(:data="data.example_code.curl")
    template(#what-is-the-code-doing)
        h3
            code app.ts
        ol
            li Something something something dark side.
        h3
            code users_resource.ts
        ul
            li This file will handle <code>GET</code> requests to the <code>/users/:id</code> URI.
            li This file is setup to simulate user authentication via the <code>?auth_token=shield</code> URL query param.
            li If a <code>GET localhost:1337/users/:id?response_content_type=text/html</code> request is made, then this resource will show the user's alias and a "Please log in to view this profile." message.
            li If a <code>GET localhost:1337/users/:id?response_content_type=text/html&auth_token=shield</code> request is made, then this resource will show the user's alias and the rest of the user's details.
            li If a <code>GET localhost:1337/users/:id?response_content_type=application/json</code> request is made, then this resource will show the user's alias.
            li If a <code>GET localhost:1337/users/:id?response_content_type=application/json&auth_token=shield</code> request is made, then this resource will show the user's alias and the rest of the user's details.
            li If any of the <code>GET</code> requests above are made and the user ID doesn't exist, then this resource will send a 404 Not Found response. This example only has three users.
</template>

<script>
export const resource = {
    paths: ["/tutorials/content-negotiation"],
    meta: {
        title: "Content Negotiation",
        source_code_uri: "/content_negotiation"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.content_negotiation,
                toc: {
                    items: [
                        "Before You Get Started",
                        "Folder Structure End State",
                        "Steps",
                        "What Is The Code Doing?"
                    ]
                }
            }
        };
    },
}
</script>

