<template lang="pug">
div
    page-header(:route="$route")
    slot
    end-of-tutorial
</template>

<script>
import Vue from "vue";

let component = {};

Vue.component("page-tutorial", component);

export default component;
</script>

