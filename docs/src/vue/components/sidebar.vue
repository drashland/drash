<template lang="pug">
div.c-sidebar
    div(v-if="$conf.webpack_mode != 'production'")
        p.l-environment-text(style="position:fixed")
            span.text ENV: {{ $conf.webpack_mode }}
    div.c-sidebar__header(style="padding: 3rem 0;")
        div.row.align-items-center.text-align--center
            div.col
                h1.module-name
                    a(:href="$conf.base_url + '/#/'") Drash
                div
                    a(href="https://github.com/crookse/deno-drash/releases" target="_BLANK")
                        img.margin-bottom--0(alt="GitHub release" src="https://img.shields.io/github/release/crookse/deno-drash.svg?color=brightgreen&label=latest" width="auto" height="20")
                div
                    a(href="https://travis-ci.org/crookse/deno-drash" target="_BLANK")
                        img.margin-bottom--0(alt="Travis CI Build Master" src="https://travis-ci.org/crookse/deno-drash.svg?branch=master" width="auto" height="20")
                div
                    a(href="https://github.com/denoland/deno_install" target="_BLANK")
                        img.margin-bottom--0(alt="deno compatibility" :src="$conf.shields.requires_deno" width="auto" height="20")
                div
                    a(href="https://github.com/denoland/deno_std" target="_BLANK")
                        img.margin-bottom--0(alt="deno_std compatibility" :src="$conf.shields.deno_std" width="auto" height="20")
    div.c-sidebar__body
        div.c-sidebar__menu
            a.heading-link(:href="$conf.base_url + '/#/introduction#top'") Introduction
            div.c-sidebar__menu-body
                a(:href="$conf.base_url + '/#/introduction#what-is-drash'") What is Drash?
                a(:href="$conf.base_url + '/#/introduction#quickstart'") Quickstart
                a(:href="$conf.base_url + '/#/introduction#importing'") Importing
                a(:href="$conf.base_url + '/#/introduction#features'") Features
                a(:href="$conf.base_url + '/#/introduction#file-an-issue'") File An Issue
            a.heading-link Tutorials
            div.c-sidebar__menu-body
                a Resources
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/tutorials/creating-a-resource'") Creating A Resource
                    a(:href="$conf.base_url + '/#/tutorials/resource-lifecycle-hooks'") Lifecycle Hooks
                a(:href="$conf.base_url + '/#/tutorials/creating-a-server'") Creating A Server
                a(:href="$conf.base_url + '/#/tutorials/serving-static-paths'") Serving Static Paths
                a(:href="$conf.base_url + '/#/tutorials/adding-content-types'") Adding Content Types
                a(:href="$conf.base_url + '/#/tutorials/content-negotiation'") Content Negotiation
                a Logging
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/tutorials/logging-to-the-terminal'") Logging To The Terminal
                    a(:href="$conf.base_url + '/#/tutorials/logging-to-files'") Logging To Files
                    router-link(href="/tutorials/logging-using-log-from-deno-std") Logging Using Log From deno_std
                a(:href="$conf.base_url + '/#/tutorials/adding-global-members'") Adding Global Members
            a.heading-link Tutorials (Creating An App)
            div.c-sidebar__menu-body
                a Hello World
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/tutorials/creating-an-app-hello-world-part-1'") Part 1 of 4: Handling GET requests
                    a(:href="$conf.base_url + '/#/tutorials/creating-an-app-hello-world-part-2'") Part 2 of 4: Building the front end
                    a(:href="$conf.base_url + '/#/tutorials/creating-an-app-hello-world-part-3'") Part 3 of 4: Handling POST requests
                    a(:href="$conf.base_url + '/#/tutorials/creating-an-app-hello-world-part-4'") Part 4 of 4: Logging
                //- a(:href="$conf.base_url + '/#/tutorials/creating-an-app/api'") Creating An Application: API
                //- a(:href="$conf.base_url + '/#/tutorials/creating-an-app/html'") Creating An Application: HTML
            a.heading-link(:href="$conf.base_url + '/#/api-reference#top'") API Reference
            div.c-sidebar__menu-body
                a(:href="$conf.base_url + '/#/api-reference/compilers'") Compilers
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/api-reference/compilers/doc-blocks-to-json'") DocBlocksToJson
                //- a(:href="$conf.base_url + '/#/api-reference/dictionaries'") Dictionaries
                a(:href="$conf.base_url + '/#/api-reference/exceptions'") Exceptions
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/api-reference/exceptions/http-exception'") HttpException
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
                a(:href="$conf.base_url + '/#/api-reference/util'") Util
                div.l-submenu-1
                    a(:href="$conf.base_url + '/#/api-reference/util/exports'") Exports
                    a(:href="$conf.base_url + '/#/api-reference/util/object-parser'") ObjectParser
    div.c-sidebar__footer
        div.row
            div.col.text-align--center
                p.l-icons
                    a(href="https://github.com/crookse/deno-drash", target="_BLANK")
                        i.fab.fa-github
                hr
                p Drash {{ $conf.latest_release }} was developed using {{ $conf.deno_version }}.
                p Drash Documentation was last updated on {{ $conf.build_date }}
</template>

<script>
export default {
    data() {
        return {};
    },
}
</script>
