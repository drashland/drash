<template lang="pug">
div
    page-header(:route="$route")
    div.row(v-if="!custom")
        div.col
            hr
            h2 Table Of Contents
            slot(name="table-of-contents")
    div.row(v-if="!custom")
        div.col
            hr
            h2#before-you-get-started Before You Get Started
            ul
                li This tutorial assumes you have Deno {{ $conf.deno_version_requirement }} installed. If you do not, then head over to <a href="https://github.com/denoland/deno_install" target="_BLANK">https://github.com/denoland/deno_install</a> to install Deno {{ $conf.deno_version_requirement }}.
                li This tutorial assumes you have the latest version of Drash installed.
                slot(name="before-you-get-started")
    div.row(v-if="!custom")
        div.col
            hr
            h2#folder-structure-end-state Folder Structure End State
            ul
                li Upon completing this tutorial, your project's folder structure should look similar to:
                    code-block(:data="data.example_code.folder_structure")
    div.row(v-if="!custom")
        div.col
            hr
            h2#steps Steps
            slot(name="steps")
    div.row(v-if="!custom")
        div.col
            hr
            h2#what-is-the-code-doing What Is The Code Doing?
            slot(name="what-is-the-code-doing")
    div.row(v-if="!custom && !hide_screenshot")
        div.col
            hr
            h2#screenshot Screenshot(s)
            slot(name="screenshot")
    slot(name="custom")
    end-of-tutorial
</template>

<script>
import Vue from "vue";

let component = {
    props: [
        "custom",
        "data",
        "hide_screenshot"
    ]
};

Vue.component("page-tutorial-default", component);

export default component;
</script>

