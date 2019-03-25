<template lang="pug">
page-api-reference(:data="data")
</template>

<script>
export const resource = {
    paths: ["/api-reference/compilers/doc-blocks-to-json"],
    meta: {
        title: "DocBlocksToJson",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Compilers"].DocBlocksToJson
            }
        };
    }
}
</script>
