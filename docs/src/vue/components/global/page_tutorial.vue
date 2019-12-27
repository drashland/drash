<template lang="pug">
div
  page-header(:route="$route")
  div.row(v-if="toc")
    div.col
      hr
      h2 Table Of Contents
      ul-toc(:data="toc")
  slot
</template>

<script>
import Vue from "vue";

let component = {
  props: {
    toc: {
      required: false,
      type: Object,
    },
  }
};

export default component;
</script>

