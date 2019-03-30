<template lang="pug">
page-api-reference(:data="data" link="/src/loggers/logger.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/loggers/console-logger"],
    meta: {
        title: "ConsoleLogger",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Loggers"].ConsoleLogger
            }
        };
    }
}
</script>
