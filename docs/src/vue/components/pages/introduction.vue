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
                p Drash is a modular web framework for <a href="https://deno.land" target="_BLANK">Deno</a> based on <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web" target="_BLANK">HTTP resources</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation" target="_BLANK">content negotiation</a>.
                p Drash helps you quickly build web apps, APIs, services, and whatever else you'd want to build using HTTP resources and content negotiation. Clients make requests to the resources you create and can request any representation your resources allow (e.g., requesting the <code>application/json</code> format of the resource located at the <code>/user/1234</code> URI).
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
                h3 Semantic Method Names
                p If you want your resource class to allow <code>GET</code> requests, then give it a <code>GET()</code> method. If you want your resource class to allow <code>POST</code> requests, then give it a <code>POST()</code> method. If you don't want your resource class to allow <code>DELETE</code> requests, then don't give your resource class a <code>DELETE()</code> method. Pretty simple ideology and very semantic.
        hr
        div.row
            div.col
                heading-h2#importing(heading="Importing")
                p There are multiple ways to import Drash (and its different versions) into your project. See below:
                ul
                    li Importing Drash master branch through the Deno Registry
                        div.b-code-example
                            pre.header
                                code.header File: /path/to/your/project/app.ts
                            pre.body
                                code.language-typescript import Drash from " https://deno.land/x/drash/mod.ts";
                    li Importing Drash latest release through the Deno Registry
                        div.b-code-example
                            pre.header
                                code.header File: /path/to/your/project/app.ts
                            pre.body
                                code.language-typescript import Drash from " https://deno.land/x/drash@{{ $conf.latest_release }}/mod.ts";
                    li Importing Drash master branch from GitHub
                        div.b-code-example
                            pre.header
                                code.header File: /path/to/your/project/app.ts
                            pre.body
                                code.language-typescript import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/master/mod.ts"
                    li Importing Drash latest release from GitHub
                        div.b-code-example
                            pre.header
                                code.header File: /path/to/your/project/app.ts
                            pre.body
                                code.language-typescript import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/{{ $conf.latest_release }}/mod.ts"
        hr
        div.row
            div.col
                heading-h2#quickstart(heading="Quickstart")
                h3 Before you get started
                ul
                    li This quickstart guide sets you up with a VERY basic application that can handle the following content types:
                        ul
                            li <code>application/json</code>
                            li <code>text/html</code>
                            li <code>application/xml</code>
                            li <code>text/xml</code>
                h3 Steps
                ol
                    li Create your app file.
                        code-block(:data="example_code.quickstart")
                    li Run your app.
                    div.b-code-example
                        pre.header
                            code.header Terminal
                        pre.body
                            code.language-typescript deno /path/to/your/project/app.ts --allow-net
                    li Make the following <code>GET</code> and <code>POST</code> requests:
                        p.text--help I recommend using <a href="https://www.getpostman.com/" target="_BLANK">Postman</a> to make these requests. It's fast and versatile for web development.
                        ul
                            li <code>localhost:8000</code>
                p.text--help This is the end of the quickstart tutorial.
        hr
        div.row
            div.col
                heading-h2#something_missing(heading="Something Missing?")
                p If you find that something is missing in these pages (or if you find that something needs more clarification), then please file an issue at <a href="https://github.com/crookse/deno-drash/issues" target="_BLANK">https://github.com/crookse/deno-drash/issues</a>. We would love to hear from you!
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

