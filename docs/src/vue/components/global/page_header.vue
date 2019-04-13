<template lang="pug">
div.c-page__header
    div.row
        div.col
            h1.c-heading.c-heading--style-2 {{ route.meta.title }}
</template>

<script>
export default {
    props: [
        'route',
    ]
}
</script>
