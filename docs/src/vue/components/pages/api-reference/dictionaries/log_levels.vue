<template lang="pug">
page-api-reference-dictionary(:data="data" link="/src/dictionaries/log_levels.ts")
</template>

<script>
export const resource = {
    paths: ["/api-reference/dictionaries/log-levels"],
    meta: {
        title: "LogLevels",
    }
}

export default {
    data() {
        return {
            data: {
                class: this.$store.page_data.api_reference["Drash.Dictionaries"].LogLevels
            }
        };
    }
}
</script>
