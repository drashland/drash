<template lang="pug">
div.c-page-section-heading-block
    h2.l-heading {{ heading }}
    span.l-subheading(v-if="sub_heading") {{ sub_heading }}
</template>

<script>
export default {
    props: [
        'heading',
        'sub_heading'
    ],
    data() {
        return {
        };
    }
}
</script>
