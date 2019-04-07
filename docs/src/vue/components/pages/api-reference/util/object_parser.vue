<template lang="pug">
page-api-reference(:data="data" link="/src/util/object_parser.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/util/object-parser"],
    meta: {
        title: "ObjectParser",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Util"].ObjectParser
            }
        };
    }
}
</script>
