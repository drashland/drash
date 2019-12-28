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
      example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/middleware/adding_server_level_middleware'],
      toc: {
        items: [
          "Before You Get Started",
          "Folder Structure End State",
          "Steps",
          "Verification",
        ]
      }
    };
  },
}
</script>


<template lang="pug">
page-tutorial(
  :toc="toc"
)
  div.row
    div.col
      hr
      h2-hash Before You Get Started
      p Server-level middleware is middleware that is executed by the server on every request.
      p-view-source-code(:source_code_uri="$route.meta.source_code_uri")
  div.row
    div.col
      hr
      div-folder-structure-end-state(:code_block_data="example_code.folder_structure")
  div.row
    div.col
      hr
      h2-hash Steps
      ol
        li Create your resource file.
          p
            code-block(:data="example_code.home_resource")
        li Create your middleware file.
          p
            code-block(:data="example_code.verify_token_middleware")
          p Your middleware will check if <code>super_secret_token</code> was passed in the request's URL. If not, then a <code>400</code> error will be thrown. It will also check if the value of <code>super_secret_token</code> is <code>AllYourBaseAreBelongToUs</code>. If not, then a <code>403</code> error will be thrown.
        li Create your app file.
          p
            code-block(:data="example_code.app")
          p Your app file will load in Drash, your resource, your middleware, set up your server, and start your server.
  div.row
    div.col
      hr
      h2-hash Verification
      p You can verify that your app's code works by making requests like the ones below. Since this tutorial's app sets <code>application/json</code> as the <code>response_output</code>, the server responds to requests with JSON by default.
      ol
        li Run your app.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | deno --allow-net app.ts
        li Make a request using <code>curl</code> like below or go to <code>localhost:1447/</code> in your browser.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | curl localhost:1447/
          p <code>VerifyTokenMiddleware</code> is run on every request because it was specified as server-level middleware. This request is missing the <code>super_secret_token</code> query param; therefore, you should receive the following response:
          p
            code-block-slotted(:header="false")
              template(v-slot:code) "Where is the token?"
        li Make the same request with a bad token.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | curl localhost:1447/?super_secret_token=IsThisIt
          p You should receive the following response:
          p
            code-block-slotted(:header="false")
              template(v-slot:code) "Mmm... \"IsThisIt\" is a bad token."
        li Make the same request with the expected token.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | curl localhost:1447/?super_secret_token=AllYourBaseAreBelongToUs
          p You should receive the following response (we pretty-printed the response for you):
          p
            code-block-slotted(language="javascript" :header="false")
              template(v-slot:code)
                | {
                |   "method": "GET",
                |   "body": "Hello!"
                | }
</template>
