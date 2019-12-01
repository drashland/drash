<template lang="pug">
div
    page-header(:route="$route")
    slot
</template>

<script>
import Vue from "vue";

let component = {};

Vue.component("page", component);

export default component;
</script>

