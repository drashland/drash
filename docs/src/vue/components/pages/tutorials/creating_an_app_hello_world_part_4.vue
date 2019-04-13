<template lang="pug">
page-creating-an-app-hello-world(:data="data")
    template(v-slot:steps)
        ol
            li Enable logging by setting the server's <code>logger</code> config.
                code-block(:data="data.example_code.app" line_highlight="20")
            li Run your app.
                code-block(:data="data.example_code.run")
                p When you start your app, you should see the following in the terminal:
                code-block(:data="data.example_code.output")
            li Type your name in the Name input field and click the POST button.
    template(v-slot:what-is-the-code-doing)
        h3 <code>index.ejs</code>
        ol
            li An input field and a POST button is added to the UI. When a name is typed into the input field and the POST button is clicked, the server will respond with some data and it will be displayed under the "POST response" label.
            li <a href="https://github.com/axios/axios" target="_BLANK">axios</a> is being used to make the <code>POST</code> request to the server at the <code>/</code> URI.
            li The <code>response_content_type</code> URL query param is added to make sure the response received back from the server is <code>application/json</code>.
            li The <code>name</code> URL query param is added to make the server's response a bit more dynamic. The server will check for this param and use it in the response. This param is the value of the input field.
        h3 <code>app.ts</code>
        ol
            li The <code>POST</code> method is added to <code>HomeResource</code> so that <code>POST</code> requests can be handled at the <code>/</code> URI.
            li The default response is "POST request received!" as a string. If the request includes a <code>name</code> URL query param, then it will be added to the response.
        h3 <code>deno</code> (in the terminal)
        ol
            li Deno runs <code>app.ts</code> as it did in the previous tutorial.
    template(v-slot:screenshot)
        a(:href="$conf.base_url + '/public/assets/img/creating_an_app_hello_world_part_4.png'")
            img(:src="$conf.base_url + '/public/assets/img/creating_an_app_hello_world_part_4.png'")
</template>

<script>
export const resource = {
    paths: ["/tutorials/creating-an-app-hello-world-part-4"],
    meta: {
        title: "Creating An App: Hello World (Part 4 of 4)",
        source_code_uri: "/creating_an_app_hello_world_part_4"
    }
}

export default {
    data() {
        return {
            data: {
                example_code: this.$app_data.example_code.tutorials.creating_an_app_hello_world_part_4
            }
        };
    },
}
</script>
