<template lang="pug">
page-tutorial-default(:data="data" :hide_screenshot="true")
    template(#table-of-contents)
        ul-toc(:data="data.toc")
    template(#before-you-get-started)
        ul
            li Drash servers use the <code>Drash.Http.Response</code> class to send properly formatted responses to clients.
            li Out of the box, Drash can send responses in the following formats:
                ul
                    li <code>application/json</code>
                    li <code>text/html</code>
                    li <code>application/xml</code>
                    li <code>text/xml</code>
            li If you want your Drash server to send responses in more formats, then you will need to override and replace <code>Drash.Http.Response</code>.
            list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
    template(#steps)
        ol
            li Create your app file.
                code-block(:data="data.example_code.app")
            li Create your new <code>Response</code> class that will be used to replace <code>Drash.Http.Response</code>.
                ul
                    li Your new class will be able to handle the following content types: <code>text/html</code>, <code>application/json</code>, <code>application/pdf</code>, <code>application/xml</code>, <code>text/xml</code>, and <code>text/plain</code>.
                    li Your new class only needs to override the <code>send()</code> method. You can override more members of the <code>Drash.Http.Response</code> class, but it's not necessary.
                code-block(:data="data.example_code.response")
            li Run your app.
                code-block(:data="data.example_code.run")
            li Enter the following URLs in your browser to see your Drash server send the different content types.
                ul
                    li <code>localhost:1337?response_content_type=text/html</code>
                    li <code>localhost:1337?response_content_type=application/json</code>
                    li <code>localhost:1337?response_content_type=application/pdf</code>
                    li <code>localhost:1337?response_content_type=application/xml</code>
                    li <code>localhost:1337?response_content_type=text/xml</code>
                    li <code>localhost:1337?response_content_type=text/plain</code>
    template(#what-is-the-code-doing)
        h3 <code>app.ts</code>
        ol
            li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
            li Your new <code>Response</code> class is imported and replaces <code>Drash.Http.Response</code>. Drash server's instantiate the <code>Drash.Http.Response</code> class to generate response objects, so replacing <code>Drash.Http.Response</code> with your new <code>Response</code> class will make your Drash server use your new <code>Response</code> class.
            li A resource class named <code>HomeResource</code> is created.
                ul
                    li <code>HomeResource</code> contains a <code>GET()</code> method. This method will handle all <code>GET</code> requests to <code>HomeResource</code>. When a client makes a <code>GET</code> request to <code>HomeResource</code>, the response the client will receive is "Hello World!" as written in the <code>response</code> object's <code>body</code> property. All resources have access to the <code>response</code> object via <code>this.response</code>.
                    li The path (a.k.a. URI) that <code>HomeResource</code> opens up to clients is <code>/</code> (in the <code>static paths</code> property). This means clients can only access <code>HomeResource</code> through the <code>/</code> URI.
                    li All resource classes MUST extend <code>Drash.Http.Resource</code>. You can create your own base resource class, but your base resource class has to extend <code>Drash.Http.Resource</code> before it can be extended further.
            li The Drash server is created.
                ul
                    li The address for the server is set to <code>localhost:1337</code>. This means the full address to <code>HomeResource</code> is <code>localhost:1337/</code>.
                    li The default response output is set to <code>text/html</code>. This means all responses from the server will default to the <code>text/html</code> MIME type if the <code>response_content_type</code> URL query param is not sent with the request.
                    li The Drash server is given one resource: <code>HomeResource</code>.
            li The Drash server's <code>run()</code> method is invoked so that when <code>app.ts</code> is passed to the <code>deno</code> command in the terminal, the Drash server is started.
        h3 <code>response.ts</code>
        ol
            li Drash is imported so that all subsequent lines in the file have access to the <code>Drash</code> namespace.
            li The <code>Response</code> class extends <code>Drash.Http.Response</code> so it can inherit all of the members in <code>Drash.Http.Response</code> before replacing <code>Drash.Http.Response</code> in <code>app.ts</code>.
            li The <code>send()</code> method is redefined so it can handle more content types.
            li The <code>send()</code> method checks for the set <code>Content-Type</code> header to decide what type of response to build. Note that each content type is defined as a proper MIME type. Drash uses <a href="https://github.com/jshttp/mime-db/blob/master/db.json" target="_BLANK">mime-db</a> for its MIME type database. <code>Drash.Http.Response</code> objects decide what value to use as the <code>Content-Type</code> header by calling their <code>getHeaderContentType()</code> method.
            li After the <code>send()</code> method builds the body of the response (stored in the <code>body</code> variable), it creates the object (the <code>output</code> variable) that's expected by the <code>request</code> object's <code>respond()</code> method and it sends that object to be further processed by the <code>request</code> object&ndash;completing the request-response cycle.
        h3 <code>deno</code> (in the terminal)
        ol
            li Deno runs <code>app.ts</code> and:
                ol
                    li Allows network access via <code>--allow-net</code> flag.
                    li Allows environment access via <code>--allow-env</code> flag.
                p The <code>--allow-net</code> flag is added so that the server will work.
                p The <code>--allow-env</code> flag is added because <code>Drash.Http.Response</code> objects require environment access if they're setup to serve static paths. Serving static paths isn't setup in this tutorial, but the <code>Drash.Http.Response</code> class compiles with the code that requires access to the environment. This means the <code>--allow-env</code> flag is always required.
</template>

<script>
export const resource = {
    paths: ["/tutorials/adding-content-types"],
    meta: {
        title: "Adding Content Types",
        source_code_uri: "/adding_content_types"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.adding_content_types,
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

