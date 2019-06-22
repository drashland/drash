<template lang="pug">
page-tutorial-default(:data="data")
    template(#table-of-contents)
        ul-toc(:data="data.toc")
    template(#before-you-get-started)
        li A Drash server can handle sending responses of different content types, but it is up to the resource classes to handle how their different representations are formatted.
        li Requesting different representations of a resource requires the client to explicitly ask what content type&mdash;using a correct <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types" target="_BLANK">MIME type</a> name&mdash;it wants to receive:
            ul
                li via HTTP request headers: 
                    code { "Response-Content-Type": "application/json" }
                li via URL query params: 
                    code ?response_content_type=application/json
                li via HTTP request body: 
                    code { response_content_type: "application/json" }
        li If the client doesn't explicitly ask what content type it wants to receive, then the Drash server will use the default response output that was specified when it was created. For example, if a Drash server is created as follows...
            code-block-slotted(:header="false" language="typescript" line_highlight="3")
                template(#code)
                    | let server = new Drash.Http.Server({
                    |   address: "localhost:1337",
                    |   response_output: "text/html",
                    |   resources: [HomeResource]
                    | });
            p ...then it will use <code>text/html</code> as the default response output.
        li If a default response output isn't specified, then the Drash server will use <code>application/json</code>.
        list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
    template(#steps)
        ol
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
    template(#what-is-the-code-doing)
        h3 <code>app.ts</code>
        ol
            li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
            li Your new <code>Response</code> class is imported and replaces <code>Drash.Http.Response</code>. Drash servers instantiate the <code>Drash.Http.Response</code> class to generate response objects, so replacing <code>Drash.Http.Response</code> with your new <code>Response</code> class will make your Drash server use your new <code>Response</code> class.
            li A resource class named <code>UsersResource</code> is imported to be added to the <code>Drash.Http.Server</code> object's <code>resources</code> config.
            li The Drash server is created.
                ul
                    li The address for the server is set to <code>localhost:1337</code>. This means the full address to <code>UsersResource</code> is <code>localhost:1337/users/:id</code> and <code>localhost:1337/users/:id/</code>.
                    li The default response output is set to <code>application/json</code>. This means all responses from the server will default to the <code>application/json</code> MIME type if a response content type is not sent with the request.
                    li The Drash server is given one resource: <code>UsersResource</code>.
            li The Drash server's <code>run()</code> method is invoked so that when <code>app.ts</code> is passed to the <code>deno</code> command in the terminal, the Drash server is started.
        h3 <code>users_resource.ts</code>
        ol
            li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
            li The paths (a.k.a. URIs) that <code>UsersResource</code> opens up to clients are <code>/users/:id</code> and <code>/users/:id/ </code> (in the <code>static paths</code> property). This means clients can only access <code>UsersResource</code> through the <code>/users/:id</code> and <code>/users/:id/</code> URIs. Notice how <code>/users/:id</code> and <code>/users/:id/</code> are <strong>DIFFERENT</strong>. Currently, the code to get URIs like these as matching URIs is set to be released in the future. Until then, make sure you add the trailing slash.
            li A set of users are defined with the IDs of <code>1</code>, <code>2</code>, and <code>3</code>. The <code>users</code> property siumlates a small database in this example with the following columns: <code>id</code>, <code>alias</code>, <code>name</code>, <code>api_key</code>, and <code>api_secret</code>.
            li A <code>GET</code> method is added so <code>UsersResource</code> can handle <code>GET</code> requests.
            li The <code>GET</code> method is setup so that when a client makes a <code>GET</code> request to <code>UsersResource</code>, the response will be dependent on the response content type requested and the client's authentication. The response content type requested and the client's authentication will determine what goes into the response's <code>body</code> property.
                ul
                    li If the response content type requested is <code>application/json</code>, then the client will receive a JSON response.
                    li If the response content type is <code>text/html</code>, then the client will receive an HTML response.
                    li If the client isn't authenticated (via the <code>auth_token=shield</code> URL query param), then the requested data will not include the following columns: <code>id</code>, <code>name</code>, <code>api_key</code>, and <code>api_secret</code>. It will only include the value of the <code>alias</code> column.
        h3 <code>response.ts</code>
        ol
            li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
            li The <code>Response</code> class extends <code>Drash.Http.Response</code> so it can inherit all of the members in <code>Drash.Http.Response</code> before replacing <code>Drash.Http.Response</code> in <code>app.ts</code>.
            li The <code>send()</code> method is redefined so it can handle more content types.
            li The <code>send()</code> method checks for the set <code>Content-Type</code> header to decide what type of response to build. Note that each content type is defined as a proper MIME type. Drash uses <a href="https://github.com/jshttp/mime-db/blob/master/db.json" target="_BLANK">mime-db</a> for its MIME type database. <code>Drash.Http.Response</code> objects decide what value to use as the <code>Content-Type</code> header by calling their <code>getHeaderContentType()</code> method.
            li If the response content type is <code>text/html</code>, then <code>Response</code> will build an HTML document&ndash;taking the <code>response.body</code> from <code>UsersResource</code> and storing it as the body of the HTML document.
            li If the response content type is <code>application/json</code>, then <code>Response</code> will build a RESTish JSON string&ndash;taking the <code>response.body</code> from <code>UsersResource</code> and storing it in the <code>body</code> property.
            li After the <code>send()</code> method builds the response (stored in the <code>body</code> variable), it creates the object (the <code>output</code> variable) that's expected by the <code>request</code> object's <code>respond()</code> method and it sends that object to be further processed by the <code>request</code> object&ndash;completing the request-response cycle.
        h3 <code>deno</code> (in the terminal)
        ol
            li Deno runs <code>app.ts</code> and:
                ol
                    li Allows network access via <code>--allow-net</code> flag.
                    li Allows environment access via <code>--allow-env</code> flag.
                p The <code>--allow-net</code> flag is added so that the server will work.
                p The <code>--allow-env</code> flag is added because <code>Drash.Http.Response</code> objects require environment access if they're setup to serve static paths. Serving static paths isn't setup in this tutorial, but the <code>Drash.Http.Response</code> class compiles with the code that requires access to the environment. This means the <code>--allow-env</code> flag is always required.
    template(v-slot:screenshot)
        h3 application/json response without authentication
        ul
            li
                code localhost:1337/users/1
            li
                code localhost:1337/users/1?response_content_type=application/json
        a(:href="$conf.base_url + '/public/assets/img/content_negotiation_application_json.png'")
            img(:src="$conf.base_url + '/public/assets/img/content_negotiation_application_json.png'")
        h3 application/json response with authentication
        ul
            li
                code localhost:1337/users/1?auth_token=shield
            li
                code localhost:1337/users/1?response_content_type=application/json&auth_token=shield
        a(:href="$conf.base_url + '/public/assets/img/content_negotiation_application_json_auth_token.png'")
            img(:src="$conf.base_url + '/public/assets/img/content_negotiation_application_json_auth_token.png'")
        h3 text/html response without authentication
        ul
            li
                code localhost:1337/users/1?response_content_type=text/html
        a(:href="$conf.base_url + '/public/assets/img/content_negotiation_text_html.png'")
            img(:src="$conf.base_url + '/public/assets/img/content_negotiation_text_html.png'")
        h3 text/html response with authentication
        ul
            li
                code localhost:1337/users/1?response_content_type=text/html&auth_token=shield
        a(:href="$conf.base_url + '/public/assets/img/content_negotiation_text_html_auth_token.png'")
            img(:src="$conf.base_url + '/public/assets/img/content_negotiation_text_html_auth_token.png'")
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
                example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/content_negotiation'],
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

