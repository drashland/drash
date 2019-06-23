<style lang="scss">
$g-font-family-code: SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
.page--reference {
    p {
        margin-bottom: 1rem;
    }
    .type-heading {
        margin-bottom: 2rem;
        padding: 1rem;
        &.--class {
            color: #efefef;
            background: #000;
        }
        &.--methods {
            // border-bottom: 4px solid #ff7700;
            color: #efefef;
            background: #ff7700;
            padding: 0.5rem 1rem;
        }
        &.--exported {
            color: #efefef;
            background: #03a9f4;
            padding: 0.5rem 1rem;
            // border-bottom: 4px solid #03a9f4;
        }
    }
    .card {
        margin-bottom: 2rem;
        &.--method {
            border-left: 10px solid #ff7700;
        }
        &.--exported {
            border-left: 10px solid #333333;
        }
    }
    .card-title {
        font-size: 1.2rem;
    }
    .tag-row {
        margin-bottom: 1rem;
        &:last-of-type {
            margin-bottom: 0;
        }
    }
    .tag-row__heading {
        display: block;
        margin-bottom: 1rem;
    }
    .tag-row p:last-of-type {
        margin-bottom: 0;
    }
    .tag-row ul {
        margin-top: 0;
    }
    .tag-row ul li ul,
    .tag-row ul ul {
        margin-top: 1rem;
        margin-bottom: 0;
    }
}
</style>

<template lang="pug">
div.page.page--reference
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 API Reference
    div.c-page__body
        hr
        div.row
            div.col
                h2 {{ data.fully_qualified_name }}
                p
                    a(:href="'https://github.com/crookse/deno-drash/tree/master' + link" target="_BLANK" v-if="link") View raw code
                p Below is a list of members that don't belong to a class. They only belong to a namespace. They are considered "members only" and are exported for use via <code>{{ data.fully_qualified_name }}.{memberName}</code>.
        hr
        div.row(v-for="member in data.namespace")
            div.col
                h2 {{ member.fully_qualified_name }}
                div.exported
                    div.card.--exported
                        div.card-body
                            div.card-title(v-if="member.is_interface")
                                pre
                                    code.c-code-signature.language-typescript(v-html="member.signature")
                            div.card-title(v-else)
                                code.c-code-signature.language-typescript {{ member.signature }}
                            hr(style="margin: 1rem 0")
                            div.tag-row(v-show="member.description && member.description.length > 0")
                                strong.tag-row__heading Description
                                ul
                                    li(v-for="description in member.description" :inner-html.prop="description | markdown-it")
</template>

<script>
export default {
    props: [
        'data',
        'link'
    ],
    data() {
        return {
            raw_code_data: ""
        };
    },
    watch: {
        raw_code_data() {
            setTimeout(function() {
                Prism.highlightAll();
            }, 2000);
        }
    },
    mounted() {
        Prism.highlightAll();
    },
    methods: {
        empty(inputObj) {
            return !inputObj || Object.keys(inputObj).length <= 0;
        },
        replaceNewLines(string) {
            string = string.replace(/\n/g, "<br>");
            return string;
        }
    }
}
</script>
