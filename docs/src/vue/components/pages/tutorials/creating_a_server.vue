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
                    list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
        div.row
            div.col
                hr
                h2#folder-structure-end-state Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="data.example_code.folder_structure")
        div.row
            div.col
                hr
                h2#steps Steps
                ol
                    li Perform the initial setup of your project.
                        code-block(:data="data.example_code.folder_structure_setup")
                    li Create your HTTP resource class file and have it log an <code>INFO</code> message for each HTTP method.
                        ul
                            li This class will handle <code>GET</code>, <code>POST</code>, <code>PUT</code>, and <code>DELETE</code> requests to the <code>/</code> URI.
                        code-block(:data="data.example_code.home_resource")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                        code-block(:data="data.example_code.app")
                    li Run your app.
                        code-block(:data="data.example_code.run")
                        p When you start your app, you should see the following in the terminal:
                        code-block(:data="data.example_code.output")
                    li Make a <code>GET</code>, <code>POST</code>, <code>PUT</code>, and <code>DELETE</code> request at <code>localhost:8000</code>.
                        ul
                            li You should see a "<code>{HTTP METHOD}</code> request received!" string as the response for each request.
                            li You can change the response message for each request by editing <code>HomeResource</code> and the assignments to <code>this.response.body</code> in the HTTP methods.
</template>

<script>
export const resource = {
    paths: ["/tutorials/creating-a-server"],
    meta: {
        title: "Creating A Server",
        source_code_uri: "/creating_a_server"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this
                    .$app_data
                    .example_code['/docs/src/example_code/tutorials/creating_a_server'],
                toc: {
                    items: [
                        "Before You Get Started",
                        "Folder Structure End State",
                        "Steps",
                    ]
                }
            }
        };
    },
}
</script>
