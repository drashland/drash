<template lang="pug">
page-api-reference(:namespace="namespace")
</template>

<script>
import apiReferenceData from "/src/api_reference.json";

export const resource = {
    paths: ["/api-reference/compilers"],
    meta: {
        title: "API Reference: Compilers",
    }
}

export default {
    data() {
        return {
            namespace: apiReferenceData["Drash.Compilers"]
        };
    }
}
</script>


