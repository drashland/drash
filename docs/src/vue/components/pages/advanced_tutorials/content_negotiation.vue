<template lang="pug">
page-tutorial(:data="data")
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
        li Drash servers can handle sending responses of different content types, but it is up to the resource classes to handle how their different representations are formatted. Requesting different representations of a resource requires the client to explicitly ask what content type&mdash;using a correct <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types" target="_BLANK">MIME type</a> name&mdash;it wants to receive:
        ul
          li Requesting <code>application/json</code> via request headers: 
            code { "Response-Content-Type": "application/json" }
          li Requesting <code>text/html</code> via URL query params: 
            code ?response_content_type=text/html
          li Requesting <code>application/xml</code> via request body: 
            code { response_content_type: "application/xml" }
        li If the client does not explicitly ask what content type it wants to receive, then the server will use the default response output that was specified when it was created. For example, if a server is created as follows ...
          code-block-slotted(:header="false" language="typescript" line_highlight="3")
            template(#code)
                | let server = new Drash.Http.Server({
                |   address: "localhost:1337",
                |   response_output: "text/html",
                |   resources: [HomeResource]
                | });
          p ...then it will use <code>text/html</code> as the default response output. If a default response output is not specified, then the server will use <code>application/json</code>.
      list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
      div.row
        div.col
          hr
          h2#steps Steps
          ul
            li Create your app file.
              code-block(:data="data.example_code.app")
            li Create your HTTP resource class file.
              code-block(:data="data.example_code.users_resource")
            li Create your <code>Response</code> class so your Drash server can handle HTML with Tailwind CSS and JSON with some RESTish fields.
              code-block(:data="data.example_code.response")
            li Run your app.
              code-block(:data="data.example_code.run")
            li Enter the following URLs in your browser to see the different responses:
              code-block-slotted(:header="false")
                template(#code)
                  | localhost:1337/users/1?response_content_type=text/html&auth_token=shield
                  | localhost:1337/users/2?response_content_type=text/html&auth_token=shield
                  | localhost:1337/users/3?response_content_type=text/html&auth_token=shield
                  | localhost:1337/users/1?response_content_type=text/html
                  | localhost:1337/users/2?response_content_type=text/html
                  | localhost:1337/users/3?response_content_type=text/html
                  | localhost:1337/users/1?response_content_type=application/json&auth_token=shield
                  | localhost:1337/users/2?response_content_type=application/json&auth_token=shield
                  | localhost:1337/users/3?response_content_type=application/json&auth_token=shield
                  | localhost:1337/users/1?response_content_type=application/json
                  | localhost:1337/users/2?response_content_type=application/json
                  | localhost:1337/users/3?response_content_type=application/json
                  | localhost:1337/users/4
                  | localhost:1337/users/4?response_content_type=text/html
                  | localhost:1337/users/4?response_content_type=text/html&auth_token=shield
</template>

<script>
export const resource = {
    paths: ["/tutorials/resources/content-negotiation"],
    meta: {
        title: "Content Negotiation",
        source_code_uri: "/tutorials/resources/content_negotiation"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/resources/content_negotiation'],
                toc: {
                    items: [
                        "Before You Get Started",
                        "Folder Structure End State",
                        "Steps",
                        "What Is The Code Doing?",
                        "Screenshot"
                    ]
                }
            }
        };
    },
}
</script>

