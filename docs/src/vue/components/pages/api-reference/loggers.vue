<template lang="pug">
page-api-reference(:data="data")
</template>

<script>
export const resource = {
    paths: ["/api-reference/loggers/logger"],
    meta: {
        title: "Logger",
    }
}

export default {
    data() {
        return {
            data: {
                fully_qualified_name: "Loggers",
                class: this.$store.page_data.api_reference["Drash.Loggers"].Logger
            }
        };
    }
}
</script>
