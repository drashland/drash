<template lang="pug">
page-api-reference(:data="data" link="/src/http/server.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/http/server"],
    meta: {
        title: "Server",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Http"].Server
            }
        };
    }
}
</script>
