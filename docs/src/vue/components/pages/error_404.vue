<template lang="pug">
div
    div.row
        div.col
            div.alert.alert-danger.text-align--center(style="padding-top: 2rem; padding-bottom: 2rem;")
                h1 404 Not Found
                p.margin-bottom--0 URI <code>{{ $route.path }}</code> doesn't exist.
</template>

<script>
export const resource = {
    paths: ["/404"],
    meta: {
        title: "404 Not Found",
    }
}

export default {
    data() {
        return {
            example_code: this.$app_data.example_code.getting_started
        };
    },
}
</script>

