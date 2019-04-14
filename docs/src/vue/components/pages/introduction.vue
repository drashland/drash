<template lang="pug">
div
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 {{ $route.meta.title }}
    div.c-page__body
        hr
        div.row
            div.col
                heading-h2#what-is-drash(heading="What is Drash?")
                p Drash is a microframework for <a href="https://deno.land" target="_BLANK">Deno</a> based on <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web" target="_BLANK">HTTP resources</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation" target="_BLANK">content negotiation</a>.
                p Drash is designed to help you build your project(s) quickly with the ability to scale. You can build an API, a SaaS, a web app, an SPA (like these documentation pages), or even a static HTML site. You can even just use it as a logging tool for your other project. How you use Drash is up to you, so that it can be everything you need and nothing you don't.
        hr
        div.row
            div.col
                heading-h2#quickstart(heading="Quickstart")
                p Write your <code>app.ts</code> file...
                p
                    code-block(:data="example_code.quickstart.app")
                p ... and run your <code>app.ts</code> file.
                p
                    code-block(:data="example_code.quickstart.execute")
        hr
        div.row
            div.col
                heading-h2#importing(heading="Importing")
                p
                    code-block(:data="example_code.importing.app")
                p It is recommended that you import the latest release or a specific release to prevent breaking changes. Drash's master branch tries to keep up with the latest Deno code (including deno_std) and is subject to Deno's "disruptive renames."
        hr
        div.row
            div.col
                heading-h2#features(heading="Features")
                h3 HTTP Resources
                p Drash uses HTTP resources. It doesn't use controllers and it doesn't use <code>app.get('/', someHandler())</code>-like syntax. You create a resource class, define its URIs, and give it the HTTP methods you want it to handle/allow (e.g., <code>GET()</code>, <code>POST()</code>, <code>PUT()</code>, <code>DELETE()</code>, etc.).
                h3 Content Negotiation
                p Drash is based on resources and you can't have true resources unless clients can request different representations of those resources through content negotiation. Out of the box, Drash's <code>Drash.Http.Response</code> class can generate the following representations for resources: <code>application/json</code>, <code>text/html</code>, <code>application/xml</code>, and <code>text/xml</code>. Getting the <code>Drash.Http.Response</code> class to handle more representations is easy. Read the <a :href="$conf.base_url + '/#/tutorials/adding-content-types'">Adding Content Types</a> tutorial for more information.
                h3 Request Path Params (e.g., <code>/users/:id</code>)
                p Resources can access their URI's path params via <code>this.request.path_params.some_param</code>--allowing you to build RESTful/ish APIs.
                h3 Request URL Query Params (e.g., <code>/users?id=1234</code>)
                p Resources can access the request's URL query params via <code>this.request.url_query_params.some_param</code>.
                h3 Request Body (for <code>application/json</code> and <code>application/x-www-form-urlencoded</code> content types)
                p Resources can access the request's body via <code>this.request.body_parsed.some_param</code>.
                h3 Semantic Method Names
                p If you want your resource class to allow <code>GET</code> requests, then give it a <code>GET()</code> method. If you want your resource class to allow <code>POST</code> requests, then give it a <code>POST()</code> method. If you don't want your resource class to allow <code>DELETE</code> requests, then don't give your resource class a <code>DELETE()</code> method. Pretty simple ideology and very semantic.
        hr
        div.row
            div.col
                heading-h2#file-an-issue(heading="File An Issue")
                p File an issue (bugs, feature requests, or more documentation needed) at <a href="https://github.com/crookse/deno-drash/issues" target="_BLANK">https://github.com/crookse/deno-drash/issues</a>. We would love to hear from you!
</template>

<script>
export const resource = {
    paths: ["/", "/introduction", "/tutorials"],
    meta: {
        title: "Introduction",
    }
}

export default {
    data() {
        return {
            example_code: this.$app_data.example_code.getting_started
        };
    },
}
</script>

