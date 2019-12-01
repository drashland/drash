<template lang="pug">
page-api-reference(:data="data" link="/src/exceptions/http_middleware_exception.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/exceptions/http-middleware-exception"],
    meta: {
        title: "HttpMiddlewareException",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Exceptions"].HttpMiddlewareException
            }
        };
    }
}
</script>
