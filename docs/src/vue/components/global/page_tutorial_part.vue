<template lang="pug">
div
  page-header(:route="$route")
  div.row
    div.col
      a(
        v-for="breadcrumb in breadcrumbs"
        :class="'btn ' + breadcrumb.class"
        :href="breadcrumb.href"
        style="margin: 0 .25rem .25rem 0"
      ) {{ breadcrumb.name }}
  div.row
    div.col
      hr
      h2 Table Of Contents
      ul-toc(:data="toc")
  slot
  div.row(v-if="!end")
    div.col
      p(style="margin-bottom: 0") You can now move on to the next tutorial part.
  div.row
    div.col
      hr
  div.row
    div.col
      a(
        v-for="breadcrumb in breadcrumbs"
        :class="'btn ' + breadcrumb.class"
        :href="breadcrumb.href"
        style="margin: 0 .25rem .25rem 0"
      ) {{ breadcrumb.name }}
  div.row
    div.col
      p
</template>

<script>
export default {
  props: {
    end: {
      default: false,
      required: false,
      type: Boolean,
    },
    part: {
      required: true,
      type: Number,
    },
    parts: {
      required: true,
      type: Number,
    },
    toc: {
      required: true,
      type: Object,
    },
    uri: {
      required: true,
      type: String,
    }
  },
  computed: {
    breadcrumbs() {
      let breadcrumbs = [];
      for (let i = 1; i <= this.parts; i += 1) {
        breadcrumbs.push({
          class: this.part == i
            ? "btn-success"
            : "btn-secondary",
          href: `${this.$conf.base_url}/#${this.uri}/part-${i}`,
          name: `Part ${i}`,
        });
      }
      return breadcrumbs;
    }
  }
}
</script>
