<template lang="pug">
page-api-reference(:data="data" link="/src/http/response.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/http/response"],
    meta: {
        title: "Response",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Http"].Response
            }
        };
    }
}
</script>
