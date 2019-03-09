<template lang="pug">
div.b-code-example
    pre.header
        code.header {{ heading }}
    pre.body
        code(:class="prism") {{ code }}
</template>

<script>
export default {
    props: [
        'data'
    ],
    computed: {
        code() {
            return this.data.code
        },
        heading() {
            switch (this.data.file_extension) {
                case "txt":
                    return "Project Folder";
                case "sh":
                    return "Terminal";
                default:
                    return `/path/to/your/project/${this.data.file}`;
            }
        },
        prism() {
            let prism = "language-text";
            switch (this.data.file_extension) {
              case 'ts':
                prism = 'language-typescript';
                break;
              case 'sh':
                prism = 'language-shell';
                break;
              case 'txt':
                prism = 'language-text';
                break;
            }
            return prism;
        }
    },
    mounted() {
      Prism.highlightAll();
    }
}
</script>
