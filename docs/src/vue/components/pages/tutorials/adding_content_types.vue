<template lang="pug">
page-tutorial-default(:data="data" :hide_screenshot="true")
    template(#table-of-contents)
        ul-toc(:data="data.toc")
    template(#before-you-get-started)
        ul
            li Drash servers use the <code>Drash.Http.Response</code> class to send properly formatted responses to clients.
            li Out of the box, Drash can send responses in the following formats:
                ul
                    li <code>application/json</code>
                    li <code>text/html</code>
                    li <code>application/xml</code>
                    li <code>text/xml</code>
            li If you want your Drash server to send responses in more formats, then you will need to override and replace <code>Drash.Http.Response</code>.
            li-download-source-code(:source_code_uri="$route.meta.source_code_uri")
    template(#steps)
        ol
            li Create your app file.
                code-block(:data="data.example_code.app")
            li Create your new <code>Response</code> class that will be used to replace <code>Drash.Http.Response</code>.
                ul
                    li Your new class will be able to handle the following content types: <code>text/html</code>, <code>application/json</code>, <code>application/pdf</code>, <code>application/xml</code>, <code>text/xml</code>, and <code>text/plain</code>.
                    li Your new class only needs to override the <code>send()</code> method. You can override more members of the <code>Drash.Http.Response</code> class, but it's not necessary.
                code-block(:data="data.example_code.response")
            li Run your app.
                code-block(:data="data.example_code.run")
            li Make the following <code>GET</code> requests. I recommend using <a href="https://www.getpostman.com/" target="_BLANK">Postman</a> to make these requests. It's fast and versatile for web development.
                ul
                    li <code>localhost:1337?response_content_type=text/html</code>
                    li <code>localhost:1337?response_content_type=application/json</code>
                    li <code>localhost:1337?response_content_type=application/pdf</code>
                    li <code>localhost:1337?response_content_type=application/xml</code>
                    li <code>localhost:1337?response_content_type=text/xml</code>
                    li <code>localhost:1337?response_content_type=text/plain</code>
</template>

<script>
export const resource = {
    paths: ["/tutorials/adding-content-types"],
    meta: {
        title: "Adding Content Types",
        source_code_uri: "/adding_content_types"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.adding_content_types,
                toc: {
                    items: [
                        "Before You Get Started",
                        "Folder Structure End State",
                        "Steps",
                        "What Is The Code Doing?"
                    ]
                }
            }
        };
    },
}
</script>

