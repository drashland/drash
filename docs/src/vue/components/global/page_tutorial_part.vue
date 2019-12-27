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
  div.row(v-if="toc")
    div.col
      hr
      h2 Table Of Contents
      ul-toc(:data="toc")
  slot
  div.row(v-if="part != -1 && part != parts")
    div.col
      p.alert.alert-info You can now move on to the next tutorial part.
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
    introduction: {
      default: false,
      type: Boolean,
    },
    // conclusion: {
    //   default: false,
    //   type: Boolean,
    // },
    part: {
      required: true,
      type: Number,
    },
    parts: {
      required: true,
      type: Number,
    },
    toc: {
      required: false,
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

      let introduction = {
        class: "btn-secondary",
        href: `${this.$conf.base_url}/#${this.uri}/introduction`,
        name: `Introduction`,
      };

      if (this.introduction) {
        introduction.class = "btn-success";
      }

      breadcrumbs.push(introduction);

      // Make the parts
      for (let i = 1; i <= this.parts; i += 1) {
        breadcrumbs.push({
          class: this.part == i
            ? "btn-success"
            : "btn-secondary",
          href: `${this.$conf.base_url}/#${this.uri}/part-${i}`,
          name: `Part ${i}`,
        });
      }

      // let conclusion = {
      //   class: "btn-secondary",
      //   href: `${this.$conf.base_url}/#${this.uri}/conclusion`,
      //   name: `Conclusion`,
      // };

      // if (this.conclusion) {
      //   conclusion.class = "btn-success";
      // }

      // breadcrumbs.push(conclusion);

      return breadcrumbs;
    }
  }
}
</script>
