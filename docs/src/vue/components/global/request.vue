<template lang="pug">
div
    code {{ method.toUpperCase() }}
    span(style="display: inline-block; margin-right: 10px")
    code {{ url }}
</template>

<script>
export default {
    props: [
        'method',
        'url',
    ],
}
</script>
