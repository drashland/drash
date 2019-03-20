<template lang="pug">
page-api-reference(:namespace="namespace")
</template>

<script>
export const resource = {
    paths: ["/api-reference/compilers"],
    meta: {
        title: "API Reference: Compilers",
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
                this.namespace = response.data['Drash.Compilers'];
            });
    }
}
</script>
