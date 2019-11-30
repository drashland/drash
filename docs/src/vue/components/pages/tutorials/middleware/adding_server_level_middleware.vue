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
                  li Server-level middleware is middleware that is executed by the server on every request.
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
                    li Create your resource file.
                        p Your resource will handle <code>GET</code> requests at the <code>/</code> URI.
                        code-block(:data="data.example_code.home_resource")
                    li Create your middleware file.
                        p Your middleware will check if <code>super_secret_token</code> was passed in the request's URL. If not, then a <code>400</code> error will be thrown. It will also check if the value of <code>super_secret_token</code> is <code>AllYourBaseAreBelongToUs</code>. If not, then a <code>403</code> error will be thrown.
                        code-block(:data="data.example_code.verify_token_middleware")
                    li Create your app file.
                        p Your app file will load in Drash, your resource, your middleware, set up your server, and start your server.
                        code-block(:data="data.example_code.app")
                    li Run your app.
                        code-block(:data="data.example_code.run")
                        p When you start your app, you should see the following in the terminal:
                        code-block-output-log(:data="data.example_code.output")
        div.row
            div.col
                hr
                h2#example-requests-and-responses Example Requests And Responses
                p After you have finished the steps above, you can exercise your app's code by making requests like the ones below. Since this tutorial's app sets <code>application/json</code> as the <code>response_output</code>, the server responds to requests with JSON by default.
                ul
                    li
                        request(method="get" url="localhost:1447")
                        p This request is missing the <code>super_secret_token</code> query param and the server responds with:
                        code-block-slotted(language="javascript" :header="false")
                            template(v-slot:code) {{ data.example_code.localhost_1447.contents }}
                    li
                        request(method="get" url="localhost:1447?super_secret_token=IsThisIt")
                        p This request has the wrong <code>super_secret_token</code> query param and the server responds with:
                        code-block-slotted(language="javascript" :header="false")
                            template(v-slot:code) {{ data.example_code.localhost_1447_is_this_it.contents }}
                    li
                        request(method="get" url="localhost:1447?super_secret_token=AllYourBaseAreBelongToUs")
                        p This request has the correct <code>super_secret_token</code> query param and the server responds with:
                        code-block-slotted(language="javascript" :header="false")
                            template(v-slot:code) {{ data.example_code.localhost_1447_all_your_base_are_belong_to_us.contents }}
</template>

<script>
export const resource = {
    paths: [
        "/tutorials/middleware/adding-server-level-middleware"
    ],
    meta: {
        title: "Adding Server-Level Middleware",
        source_code_uri: "/middleware/adding_server_level_middleware"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this
                    .$app_data
                    .example_code['/docs/src/example_code/tutorials/middleware/adding_server_level_middleware'],
                toc: {
                    items: [
                        "Before You Get Started",
                        "Folder Structure End State",
                        "Steps",
                        "Example Requests And Responses",
                    ]
                }
            }
        };
    },
}
</script>

