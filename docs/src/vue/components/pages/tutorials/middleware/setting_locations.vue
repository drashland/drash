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
                    li By default, Drash executes middleware before requests are executed. For example, if a <code>GET</code> request is made to the <code>/users</code> URI and that URI is handled by <code>UsersResource</code>, then the middleware will be executed before <code>UsersResource.GET()</code> is called. You can change this behavior by telling the middleware where you want it to be executed.
                    li You can tell middleware to execute at the following locations:
                    ul
                      li
                        code before_request
                      li
                        code before_response
                      li
                        code after_response
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
                    li Create your <code>HomeResource</code> file.
                        p Your <code>HomeResource</code> file will handle <code>GET</code> requests at the <code>/</code> URI.
                        code-block(:data="data.example_code.home_resource")
                    li Create your <code>AdminDashboardResource</code> file.
                        p Your <code>AdminDashboardResource</code> file will handle <code>GET</code> requests at the <code>/dashboard</code> and <code>/dashboard/</code> URIs.
                        code-block(:data="data.example_code.admin_dashboard_resource")
                    li Create your <code>VerifyTokenMiddleware</code> middleware file.
                        p Your middleware will check if <code>super_secret_token</code> was passed in the request's URL. If not, then an error will be thrown.
                        code-block(:data="data.example_code.verify_token_middleware")
                    li Create your <code>UserIsAdminMiddleware</code> middleware file.
                        p Your <code>UserIsAdminMiddleware</code> file will check if the user is an admin. If not, then an error will be thrown. For simplicity, we will make this middleware check the user's ID in the request's URL. Specifically, it will check if <code>user_id</code> exists and that the value is <code>1337</code>.
                        code-block(:data="data.example_code.user_is_admin_middleware")
                    li Create your app file.
                        p Your app file will load in Drash, your resources, your middleware, set up your server, and start your server.
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
                            template(v-slot:code) {{ data.example_code.localhost_1447_token.contents }}
                    li
                        request(method="get" url="localhost:1447?super_secret_token=AllYourBaseAreBelongToUs")
                        p This request has the correct <code>super_secret_token</code> query param and the server responds with:
                        code-block-slotted(language="javascript" :header="false")
                            template(v-slot:code) {{ data.example_code.localhost_1447_token_and_user_is_admin.contents }}
</template>

<script>
export const resource = {
    paths: [
        "/tutorials/middleware/setting-locations"
    ],
    meta: {
        title: "Middleware: Setting Locations",
        source_code_uri: "/setting_locations"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this
                    .$app_data
                    .example_code['/docs/src/example_code/tutorials/middleware/setting_locations'],
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

