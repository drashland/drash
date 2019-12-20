<template lang="pug">
a(:href="'/#' + $route.path + '#' + hash")
  slot
</template>

<script>
import Vue from "vue";

let component = {
  props: {
    "hash": {
      required: true,
      type: String,
    },
  }
};

Vue.component("a-hash", component);

export default component;
</script>



