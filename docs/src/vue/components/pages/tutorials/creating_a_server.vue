<template lang="pug">
div
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 {{ $route.meta.title }}
    hr
    div.c-page__body
        div.row
            div.col
                h3 Before you get started
                ul
                    li You can download the source code for this tutorial here.
                h3 Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="example_code.folder_structure")
                h3 Steps
                ol
                    li Perform the initial setup of your project.
                        code-block(:data="example_code.folder_structure_setup")
                    li Create your HTTP resource class file and have it log an <code>INFO</code> message when handling a <code>GET</code> request.
                        ul
                            li This class will handle <code>GET</code> requests to the <code>/</code> URI.
                        code-block(:data="example_code.home_resource")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                        code-block(:data="example_code.app")
                    li Run your app.
                        code-block(:data="example_code.run")
                        p When you start your app, you should see the following in the terminal:
                        code-block(:data="example_code.output")
                    li Make a <code>GET</code>, <code>POST</code>, <code>PUT</code>, and <code>DELETE</code> request at <code>localhost:8000</code>.
                        ul
                            li You should see a "{HTTP METHOD} request received!" string as the response for each request.
                            li You can change the response message for each request by editing <code>HomeResource</code> and the assignments to <code>this.response.body</code> in the HTTP methods.
                p.text--help This is the end of this tutorial.
</template>

<script>
export const resource = {
    paths: ["/tutorials/creating-a-server"],
    meta: {
        title: "Creating A Server",
    }
}

export default {
    data() {
        return {
            example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/creating_a_server']
        };
    },
}
</script>
