<template lang="pug">
div.c-page__header
    div.row
        div.col
            h1.c-heading.c-heading--style-2(v-if="route") {{ route.meta.title }}
            h1.c-heading.c-heading--style-2(v-else)
                slot
</template>

<script>
export default {
    props: [
        'route',
    ]
}
</script>
