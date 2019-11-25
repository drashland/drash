<template lang="pug">
ul
    li(v-for="item in data.items")
        a(:href="$conf.base_url + '/#' + $route.path + '#' + normalize(item)") {{ item }}
</template>

<script>
import Vue from "vue";

let component = {
    props: [
        "data",
    ],
    methods: {
        normalize(item) {
            item = item.replace(/ /g, '-');
            if (/\?/.test(item)) {
                item = item.replace(/\?/g, "");
            }
            if (/\,/.test(item)) {
                item = item.replace(/\,/g, "");
            }
            return item.toLowerCase();
        }
    }
};

Vue.component("ul-toc", component);

export default component;
</script>


