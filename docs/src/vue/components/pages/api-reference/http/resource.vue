<template lang="pug">
page-api-reference(:data="data" link="/src/http/resource.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/http/resource"],
    meta: {
        title: "Resource",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Http"].Resource
            }
        };
    }
}
</script>
