<template lang="pug">
a(:href="$conf.base_url + '/#' + href")
    slot
</template>

<script>
import Vue from "vue";

let component = {
    props: [
        "href",
    ]
};

Vue.component("router-link", component);

export default component;
</script>


