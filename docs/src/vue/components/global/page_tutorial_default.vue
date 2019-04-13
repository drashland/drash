<template lang="pug">
div
    page-header(:route="$route")
    div.row
        div.col
            hr
            h2 Table Of Contents
            slot(name="table-of-contents")
    div.row
        div.col
            hr
            h2#before-you-get-started Before You Get Started
            slot(name="before-you-get-started")
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
    div.row(v-if="!hide_screenshot")
        div.col
            hr
            h2#screenshot Screenshot
            slot(name="screenshot")
    end-of-tutorial
</template>

<script>
import Vue from "vue";

let component = {
    props: [
        "data",
        "hide_screenshot"
    ]
};

Vue.component("page-tutorial-default", component);

export default component;
</script>

