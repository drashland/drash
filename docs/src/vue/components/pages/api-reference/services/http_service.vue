<template lang="pug">
page-api-reference(:data="data" link="/src/services/http_service.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/services/http-service"],
    meta: {
        title: "HttpService",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Services"].HttpService
            }
        };
    }
}
</script>
