<template lang="pug">
page-api-reference(:data="data" link="/src/loggers/console_logger.ts")
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
                class: this.$store.page_data.api_reference["Drash.Loggers"].Logger
            }
        };
    }
}
</script>
