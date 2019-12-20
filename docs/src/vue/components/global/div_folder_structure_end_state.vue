<template lang="pug">
div
  h2-hash Folder Structure End State
  p Upon completing this tutorial part, your project's folder structure should look similiar to the following:
  code-block(:data="code_block_data")
</template>

<script>
import Vue from "vue";

let component = {
  props: {
    code_block_data: {
      required: true,
      type: Object,
    }
  }
};

Vue.component("div-folder-structure-end-state", component);

export default component;
</script>

