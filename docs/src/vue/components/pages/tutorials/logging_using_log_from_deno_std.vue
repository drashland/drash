<template lang="pug">
page-tutorial-default(
    :data="data"
    :custom="true"
)
    template(v-slot:custom)
        div.row
            div.col
                hr
                h2 Table Of Contents
                ul-toc(:data="data.toc")
        div.row
            div.col
                hr
                h2#before-you-get-started Before You Get Started
                ul
                    li <a href="https://github.com/denoland/deno_std" target="_BLANK">deno_std</a> has a <a href="https://github.com/denoland/deno_std/tree/master/log" target="_BLANK">Log</a> module that is readily available and you can use it as your logger of choice.
                    li Drash uses deno_std v{{ $conf.deno_std_version }}.
                    list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
        div.row
            div.col
                hr
                h2#steps Steps
                ol
                    li Create your app file.
                        code-block(:data="data.example_code.app")
                    li Start your app.
                        code-block(:data="data.example_code.run")
                    li Enter the following URL in your browser:
                        code-block-slotted(:header="false")
                            template(#code)
                                | localhost:1337
                    li Check the terminal you started your app with and you should see the following output:
                        code-block-slotted
                            template(#title) Terminal
                            template(#code)
                                | Deno server started at localhost:1337.
                                |
                                | INFO Setting a response.
</template>

<script>
export const resource = {
    paths: ["/tutorials/logging-using-log-from-deno-std"],
    meta: {
        title: "Logging Using Log From deno_std",
        source_code_uri: "/logging_using_log_from_deno_std"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.logging_using_log_from_deno_std,
                toc: {
                    items: [
                        "Before You Get Started",
                        "Steps",
                    ]
                }
            }
        };
    },
}
</script>
