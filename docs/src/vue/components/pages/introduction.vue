<template lang="pug">
div
    div.c-page__header
        div.row
            div.col.bpm-center
                img.drash-logo(alt="Drash" :src="$conf.base_url + '/public/assets/img/logo_drash.png'" style="display: none;")
                h1.c-heading.c-heading--style-2 Drash
                p.shields
                    a(href="https://github.com/crookse/deno-drash/releases" target="_BLANK")
                        img.margin-bottom--0(alt="GitHub release" src="https://img.shields.io/github/release/crookse/deno-drash.svg?color=brightgreen&label=latest" width="auto" height="20")
                    a(href="https://github.com/denoland/deno_install" target="_BLANK")
                        img.margin-bottom--0(alt="deno compatibility" :src="$conf.shields.requires_deno" width="auto" height="20")
                    a(href="https://travis-ci.org/crookse/deno-drash" target="_BLANK")
                        img.margin-bottom--0(alt="Travis CI Build Master" src="https://img.shields.io/travis/crookse/deno-drash/master?label=master" width="auto" height="20")
    div.c-page__body
        hr
        div.row
            div.col
                heading-h2#what-is-drash(heading="What is Drash?")
                p Drash is a microframework for <a href="https://deno.land" target="_BLANK">Deno</a> focused on <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web" target="_BLANK">resource</a> creation and <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation" target="_BLANK">content negotiation</a>.
                p Drash is designed to help you build your projects quickly with the ability to scale. You can build an API, a SaaS, a web app, an SPA, or even a static HTML site (like these documentation pages). How you use Drash is up to you, so that it can be everything you need and nothing you don't&mdash;like a DRASH tent.
        hr
        div.row
            div.col
                heading-h2#quickstart(heading="Quickstart")
                p Write your <code>app.ts</code> file...
                p
                    code-block(:data="example_code.app")
                p ... and run your <code>app.ts</code> file.
                p
                    code-block(:data="example_code.execute")
        hr
        div.row
            div.col
                heading-h2#importing(heading="Importing")
                p
                    code-block-slotted(language="typescript" :header="false")
                        template(v-slot:code)
                            | // Import Drash latest release
                            | import Drash from "https://deno.land/x/drash@{{ $conf.latest_release }}/mod.ts";
                            | 
                            | // Import Drash master
                            | import Drash from "https://deno.land/x/drash/mod.ts";
                p It is recommended that you import the latest release of Drash or a specific release to prevent breaking changes. Drash's master branch tries to keep up with the latest Deno code and is subject to Deno's "disruptive renames" as stated in the Deno project.
        hr
        div.row
            div.col
                heading-h2#features(heading="Features")
                ul
                    li 
                        strong HTTP Resources
                        p Drash uses HTTP resources. It doesn't use controllers and it doesn't use <code>app.get('/', someHandler())</code>-like syntax. You create a resource class, define its URIs, and give it the HTTP methods you want it to handle/allow (e.g., <code>GET()</code>, <code>POST()</code>, <code>PUT()</code>, <code>DELETE()</code>, etc.).
                    li 
                        strong Content Negotiation
                        p Drash is based on resources and you can't have true resources unless clients can request different representations of those resources through content negotiation. Out of the box, Drash's <code>Drash.Http.Response</code> class can generate the following representations for resources: <code>application/json</code>, <code>text/html</code>, <code>application/xml</code>, and <code>text/xml</code>. Getting the <code>Drash.Http.Response</code> class to handle more representations is easy. Read the <a :href="$conf.base_url + '/#/tutorials/adding-content-types'">Adding Content Types</a> tutorial for more information.
                    li  
                        strong Request Path Params (e.g., <code>/users/:id</code>)
                        p Resources can access their URI's path params via <code>this.request.path_params.some_param</code>--allowing you to build RESTful/ish APIs.
                    li 
                        strong Request URL Query Params (e.g., <code>/users?id=1234</code>)
                        p Resources can access the request's URL query params via <code>this.request.url_query_params.some_param</code>.
                    li 
                        strong Request Body (e.g., <code>{"id":"1234"}</code>)
                        p Resources can access the request's body via <code>this.request.body_parsed.some_param</code>. Supported content types are <code>application/json</code> and <code>application/x-www-form-urlencoded</code>.
                    li 
                        strong Semantic Method Names
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
            example_code: this.$app_data.example_code['/docs/src/example_code/getting_started/quickstart']
        };
    },
}
</script>

