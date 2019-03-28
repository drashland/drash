<template lang="pug">
div
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 {{ $route.meta.title }}
    hr
    div.c-page__body
        div.row
            div.col
                p (currently a work in progress)
</template>

<script>
export const resource = {
    paths: ["/tutorials/adding-global-members"],
    meta: {
        title: "Adding Global Members",
    }
}

export default {
    data() {
        return {
            // example_code: this.$app_data.example_code.tutorials.adding_global_members
        };
    },
}
</script>

