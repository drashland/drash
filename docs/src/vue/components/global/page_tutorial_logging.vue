<template lang="pug">
div
    page-header Logging
    div.row
        div.col
            h2 {{ $route.meta.tutorial_title }}
    div.row
        div.col
            hr
            h2 Table Of Contents
            ul
                li <a :href="$conf.base_url + '/#' + $route.path + '#before-you-get-started'">Before You Get Started</a>
                li <a :href="$conf.base_url + '/#' + $route.path + '#folder-structure-end-state'">Folder Structure End State</a>
                li <a :href="$conf.base_url + '/#' + $route.path + '#steps'">Steps</a>
                li <a :href="$conf.base_url + '/#' + $route.path + '#what-is-the-code-doing'">What Is The Code Doing?</a>
    div.row
        div.col
            hr
            h2#before-you-get-started Before You Get Started
            ul
                li This tutorial assumes you have Deno {{ $conf.deno_version_requirement }} installed. If you do not, then head over to <a href="https://github.com/denoland/deno_install" target="_BLANK">https://github.com/denoland/deno_install</a> to install Deno {{ $conf.deno_version_requirement }}.
                li This tutorial assumes you have the latest version of Drash installed.
                list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
    div.row
        div.col
            hr
            h2#folder-structure-end-state Folder Structure End State
            ul
                li Upon completing this tutorial, your project's folder structure should look similar to:
                    code-block(:data="data.example_code.folder_structure")
    div.row
        div.col
            hr
            h2#steps Steps
            slot(name="steps")
    div.row
        div.col
            hr
            h2#what-is-the-code-doing What Is The Code Doing?
            slot(name="what-is-the-code-doing")
    end-of-tutorial
</template>

<script>
import Vue from "vue";

let component = {
    props: [
        "data"
    ]
};

Vue.component("page-tutorial-logging", component);

export default component;
</script>
