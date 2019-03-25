<template lang="pug">
page-api-reference(:data="data")
</template>

<script>
export const resource = {
    paths: ["/api-reference/http/request"],
    meta: {
        title: "Request",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Http"].Request
            }
        };
    }
}
</script>
