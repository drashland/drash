<template lang="pug">
div.c-sidebar
    div(v-if="$conf.webpack_mode != 'production'")
        p.l-environment-text
            span.text ENV: {{ $conf.webpack_mode }}
    div.c-sidebar__header
        div.row.align-items-center.text-align--center
            div.col
                h1.module-name(style="margin-top: 2rem;")
                    a(:href="$conf.base_url + '/#/'") Drash
                p
                    img(alt="GitHub release" src="https://img.shields.io/github/release/crookse/deno-drash.svg?color=brightgreen&label=latest" width="90" height="20")
                    | &nbsp;
                    img(alt="Travis CI Build" src="https://travis-ci.org/crookse/deno-drash.svg" width="90" height="20")
    div.c-sidebar__body
        div.c-sidebar__menu
            a.heading-link(:href="$conf.base_url + '/#/introduction#top'") Introduction
            div.c-sidebar__menu-body
                a(:href="$conf.base_url + '/#/introduction#what-is-drash'") What is Drash?
                a(:href="$conf.base_url + '/#/introduction#features'") Features
                a(:href="$conf.base_url + '/#/introduction#importing'") Importing
                a(:href="$conf.base_url + '/#/introduction#quickstart'") Quickstart
            a.heading-link Tutorials
            div.c-sidebar__menu-body
                a(:href="$conf.base_url + '/#/tutorials/adding-content-types'") Adding Content Types
                a(:href="$conf.base_url + '/#/tutorials/adding-global-members'") [x] Adding Global Members
                a(:href="$conf.base_url + '/#/tutorials/creating-a-server'") Creating A Server
                a(:href="$conf.base_url + '/#/tutorials/handling-content-negotiation'") Handling Content Negotiation
                a(:href="$conf.base_url + '/#/tutorials/logging'") Logging
                a(:href="$conf.base_url + '/#/tutorials/serving-static-paths'") Serving Static Paths
            a.heading-link(:href="$conf.base_url + '/#/api-reference#top'") API Reference
            div.c-sidebar__menu-body
                a(:href="$conf.base_url + '/#/api-reference/compilers'") Compilers
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/api-reference/compilers/doc-blocks-to-json'") DocBlocksToJson
                a(:href="$conf.base_url + '/#/api-reference/dictionaries'") [x] Dictionaries
                a(:href="$conf.base_url + '/#/api-reference/exceptions'") [x] Exceptions
                a(:href="$conf.base_url + '/#/api-reference/http'") Http
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/api-reference/http/request'") Request
                    a(:href="$conf.base_url + '/#/api-reference/http/resource'") Resource
                    a(:href="$conf.base_url + '/#/api-reference/http/response'") Response
                    a(:href="$conf.base_url + '/#/api-reference/http/server'") Server
                a(:href="$conf.base_url + '/#/api-reference/loggers'") Loggers
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/api-reference/loggers/logger'") Logger
                    a(:href="$conf.base_url + '/#/api-reference/loggers/console-logger'") ConsoleLogger
                    a(:href="$conf.base_url + '/#/api-reference/loggers/file-logger'") FileLogger
                a(:href="$conf.base_url + '/#/api-reference/services'") Services
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/api-reference/services/http-service'") HttpService
                a(:href="$conf.base_url + '/#/api-reference/util'") [x] Util
                a(:href="$conf.base_url + '/#/api-reference/vendor'") [x] Vendor
    div.c-sidebar__footer
        div.row
            div.col.text-align--center
                p.l-icons
                    a(href="https://github.com/crookse/deno-drash", target="_BLANK")
                        i.fab.fa-github
                hr
                p <a href="https://github.com/crookse/deno-drash" style="text-decoration: underline">Drash</a> is a <a href="//crookse.github.io" style="text-decoration: underline"> CROOKSE</a> project.
                p Drash {{ $conf.latest_release }} was developed using {{ $conf.deno_version }}.
</template>

<script>
export default {
    data() {
        return {};
    },
}
</script>
