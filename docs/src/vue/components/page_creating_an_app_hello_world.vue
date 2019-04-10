<template lang="pug">
div
    page-header(:route="$route")
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
                li-download-source-code(:source_code_uri="$route.meta.source_code_uri")
                li This tutorial is part of a 4-part series that build off one another:
                    ol
                        li Build a server that handles <code>GET</code> requests at the <code>/</code> URI.
                        li Build the server's front end using a template engine (EJS).
                        li Allow the server to handle <code>POST</code> requests at the <code>/</code> URI and send a <code>POST</code> request from the front end.
                        li Add logging.
                li This code assumes you have Deno installed. If you do not, then head over to <a href="https://deno.land/" target="_BLANK">https://deno.land/</a> to install Deno.
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

Vue.component("page-creating-an-app-hello-world", component);


export default component;
</script>
