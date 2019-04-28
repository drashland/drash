<template lang="pug">
page-api-reference-members-only(:data="data" link="/src/util/members.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/util/exports"],
    meta: {
        title: "Exports",
    }
}

export default {
    data() {
        return {
            data: {
                namespace: this.$store.page_data.api_reference["Drash.Util.Exports"],
                fully_qualified_name: "Drash.Util.Exports"
            }
        };
    }
}
</script>
