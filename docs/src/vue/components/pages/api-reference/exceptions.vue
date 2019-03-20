<template lang="pug">
page-api-reference(:namespace="namespace")
</template>

<script>
export const resource = {
    paths: ["/api-reference/exceptions"],
    meta: {
        title: "API Reference: Exceptions",
    }
}

export default {
    data() {
        return {
            namespace: {}
        };
    },
    mounted() {
        axios.get("/public/assets/json/api_reference.json")
            .then(response => {
                console.log(response.data);
                this.namespace = response.data["Drash.Exceptions"];
            });
    }
}
</script>
