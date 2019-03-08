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
        'data',
        'options'
    ],
    data() {
        return {
            file: this.data.file,
        };
    },
    computed: {
        code() {
            return this.data.code
        },
        heading() {
            if (this.options && this.options.heading) {
                return this.options.heading;
            }
            if (this.data.file) {
              if (this.data.file.split(".")[1] == "sh") {
                  return "Terminal";
              }
              return `File: /path/to/your/project/${this.data.file}`;
            }
            return this.data.heading;
        },
        prism() {
            if (this.data.file) {
                let prism = "language-text";
                switch (this.data.file.split(".")[1]) {
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
        }
    },
    mounted() {
      Prism.highlightAll();
    }
}
</script>
