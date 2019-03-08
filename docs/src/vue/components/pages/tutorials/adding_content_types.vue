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
                    li Drash servers use the <code>Drash.Http.Response</code> class to send properly formated responses to clients. A new import of Drash can send responses of the following content types:
                        ul
                            li <code>application/json</code>
                            li <code>application/xml</code>
                            li <code>text/html</code>
                            li <code>text/xml</code>
                    li If you want your Drash server to handle more content types, then you will need to override <code>Drash.Http.Response</code> and its <code>send()</code> method as shown in the steps below.
                    li You can download the source code for this tutorial here.
                h3 Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="example_code.folder_structure")
                h3 Steps
                ol
                    li Perform the initial setup of your project.
                        code-block(:data="example_code.folder_structure_setup")
                    li Create your HTTP resource class file.
                        ul
                            li This class will handle <code>GET</code> requests to the <code>/</code> URI.
                        code-block(:data="example_code.home_resource")
                    li Create your new <code>Response</code> class.
                        ul
                            li This class will be able to handle the following content types:
                                ul
                                    li <code>text/html</code>
                                    li <code>application/json</code>
                                    li <code>application/pdf</code>
                                    li <code>application/xml</code>
                                    li <code>text/xml</code>
                                    li <code>text/plain</code>
                        code-block(:data="example_code.response")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                        code-block(:data="example_code.app")
                    li Run your app.
                      div.b-code-example
                            pre.header
                                code.header Terminal
                            pre.body
                                code.language-typescript deno /path/to/your/project/app.ts --allow-net
                    li Make the following <code>GET</code> and <code>POST</code> requests:
                        p.text--help I recommend using <a href="https://www.getpostman.com/" target="_BLANK">Postman</a> to make these requests. It's fast and versatile for web development.
                        ul
                            li <code>localhost:8000?response_content_type=text/html</code>
                            li <code>localhost:8000?response_content_type=application/json</code>
                            li <code>localhost:8000?response_content_type=application/pdf</code>
                            li <code>localhost:8000?response_content_type=application/xml</code>
                            li <code>localhost:8000?response_content_type=text/xml</code>
                            li <code>localhost:8000?response_content_type=text/plain</code>
                p.text--help This is the end of this tutorial.
</template>

<script>
export const resource = {
    paths: ["/tutorials/adding-content-types"],
    meta: {
        title: "Adding Content Types",
    }
}

export default {
    data() {
        return {
            example_code: this.$app_data.example_code.tutorials.adding_more_content_types
        };
    },
}
</script>

