<template lang="pug">
div.c-sidebar
    div(v-if="$conf.webpack.mode != 'production'")
        p.l-environment-text
            span.text ENV: {{ $conf.webpack.mode }}
    div.c-sidebar__header
        div.row.align-items-center.text-align--center
            div.col
                h1.module-name(style="margin-top: 2rem;")
                    a(:href="$conf.base_url + '/#/'") Drash
                p
                    | <img alt="GitHub release" src="https://img.shields.io/github/release/crookse/deno-drash.svg?color=green&label=latest">
                    | <img alt="Travis CI Build" src="https://travis-ci.org/crookse/deno-drash.svg?branch=master">
    div.c-sidebar__body
        div.c-sidebar__menu
            a.heading-link(:href="$conf.base_url + '/#/introduction#top'") Introduction
            div.c-sidebar__menu-body
                a(:href="$conf.base_url + '/#/introduction#what-is-drash'") What is Drash?
                a(:href="$conf.base_url + '/#/introduction#features'") Features
                a(:href="$conf.base_url + '/#/introduction#importing'") Importing
                a(:href="$conf.base_url + '/#/introduction#quickstart'") Quickstart
            a.heading-link(:href="$conf.base_url + '/#/tutorials'") Tutorials
            div.c-sidebar__menu-body
                a(:href="$conf.base_url + '/#/tutorials/adding-content-types'") Adding Content Types
                a(:href="$conf.base_url + '/#/tutorials/handling-content-negotiation'") Handling Content Negotiation
                a(:href="$conf.base_url + '/#/tutorials/logging'") Logging
    div.c-sidebar__footer
        div.row
            div.col.text-align--center
                p.l-icons
                    a(href="https://github.com/crookse/deno-drash", target="_BLANK")
                        i.fab.fa-github
                hr
                p <a href="https://github.com/crookse/deno-drash" style="text-decoration: underline">Drash</a> is a <a href="//crookse.github.io" style="text-decoration: underline"> CROOKSE</a> project.
</template>

<script>
export default {
    data() {
        return {};
    },
}
</script>
