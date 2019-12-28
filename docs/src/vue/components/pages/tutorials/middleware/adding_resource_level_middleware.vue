<script>
export const resource = {
  paths: [
    "/tutorials/middleware/adding-resource-level-middleware"
  ],
  meta: {
    title: "Adding Resource-Level Middleware",
    source_code_uri: "/middleware/adding_resource_level_middleware"
  }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/middleware/adding_resource_level_middleware'],
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
      p Resource-level middleware is middleware that can only be executed by resources. That is, if a resource specifies a list of middleware in its <code>middleware</code> property, then that middleware will be executed.
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
        li Create your <code>HomeResource</code> file.
          p
           code-block(:data="example_code.home_resource")
        li Create your <code>SecretResource</code> file.
          p
            code-block(:data="example_code.secret_resource")
          p This resource will tell the server to execute <code>VerifyTokenMiddleware</code> before it handles any requests. You will create <code>VerifyTokenMiddleware</code> in the next step.
        li Create your middleware file.
          p
            code-block(:data="example_code.verify_token_middleware")
          p This middleware will only be executed at the <code>/secret</code> URI. It will check if <code>super_secret_token</code> was passed in the request's URL. If not, then a <code>400</code> error will be thrown. It will also check if the value of <code>super_secret_token</code> is <code>AllYourBaseAreBelongToUs</code>. If not, then a <code>403</code> error will be thrown.
        li Create your app file.
          p
            code-block(:data="example_code.app")
          p Your app file will load in Drash, your resources, your middleware, set up your server, and start your server.
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
          p This request is not filtered by <code>VerifyTokenMiddleware</code>; therefore, you should receive the following response (we pretty-printed the response for you):
          p
            code-block-slotted(language="javascript" :header="false")
              template(v-slot:code)
                | {
                |   "method": "GET",
                |   "body": "Hello!"
                | }
        li Make a request using <code>curl</code> like below or go to <code>localhost:1447/secret</code> in your browser.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | curl localhost:1447/secret
          p This request is filtered by <code>VerifyTokenMiddleware</code>, but it is missing the <code>super_secret_token</code> query param; therefore, you should receive the following response:
          p
            code-block-slotted(:header="false")
              template(v-slot:code) "Where is the token?"
        li Make a request using <code>curl</code> like below or go to <code>localhost:1447/secret?super_secret_token=IsThisIt</code> in your browser.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | curl localhost:1447/secret?super_secret_token=IsThisIt
          p This request is filtered by <code>VerifyTokenMiddleware</code>, but it has the wrong <code>super_secret_token</code> query param; therefore you should receive the following response:
          p
            code-block-slotted(:header="false")
              template(v-slot:code) "Mmm... \"IsThisIt\" is a bad token."
        li Make a request using <code>curl</code> like below or go to <code>localhost:1447/secret?super_secret_token=AllYourBaseAreBelongToUs</code> in your browser.
          p
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | curl localhost:1447/secret?super_secret_token=AllYourBaseAreBelongToUs
          p This request is filtered by <code>VerifyTokenMiddleware</code> and it has the correct <code>super_secret_token</code> query param; therefore you should receive the following response (we pretty-printed the response for you):
          p
            code-block-slotted(language="javascript" :header="false")
              template(v-slot:code)
                | {
                |   "method": "GET",
                |   "body": "You have accessed the secret resource!"
                | }
</template>
