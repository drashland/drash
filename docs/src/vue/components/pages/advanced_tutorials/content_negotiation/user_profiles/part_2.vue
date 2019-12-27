<script>
export const resource = {
    paths: ["/advanced-tutorials/content-negotiation/user-profiles/part-2"],
    meta: {
        title: "Content Negotation: User Profiles",
        subtitle: "Part 2: Creating The Server",
        source_code_uri: "/advanced_tutorials/content_negotiation/user_profiles/part_2"
    }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code' + resource.meta.source_code_uri],
      part: 2,
      parts: 5,
      toc: {
        items: [
          "Before You Get Started",
          "Folder Structure End State",
          "Steps",
          "Verification",
        ]
      },
      uri: "/advanced-tutorials/content-negotiation/user-profiles"
    };
  },
}
</script>

<template lang="pug">
page-tutorial-part(
  :part="part"
  :parts="parts"
  :toc="toc"
  :uri="uri"
)
  div.row
    div.col
      hr
      h2-hash Before You Get Started
      p Now that you have your user records from your "database" in place from Part 1, you need a server to handle requests for that data. The server you will create in this tutorial part will be very basic. It will only handle requests to one resource. This resource will be your users resource.
      p-view-source-code
  div.row
    div.col
      hr
      div-folder-structure-end-state(:code_block_data="example_code.folder_structure")
  div.row
    div.col
      hr
      h2-hash Steps
      ol
        li
          p Create your app file.
          code-block(:data="example_code.app" language="javascript" line_highlight="3,8")
          p When this file is run, it will load in Drash, set up your server, and start your server.
          p You will notice that there is an <code>import</code> statement for a <code>users_resource.ts</code> file (highlighted). You will be creating this file in the next tutorial part. For now, you just need to make sure your server expects and registers this resource file.
  div.row
    div.col
      hr
      h2-hash Verification
      p If you run your app in its current state, you will get an error. The TypeScript compiler will throw an error stating it cannot resolve the <code>users_resource.ts</code> module. So, before you verify that your server is working, you need to comment out the lines relevant to <code>users_resource.ts</code>.
      ol
        li Comment out the <code>import</code> statement and <code>resources</code> config.
          code-block-slotted(language="typescript" line_highlight="3,8")
            template(v-slot:title) /path/to/your/project/app.ts
            template(v-slot:code)
              | import Drash from "https://deno.land/x/drash/mod.ts";
              |
              | // import UsersResource from "./users_resource.ts";
              |
              | let server = new Drash.Http.Server({
              |   address: "localhost:1447",
              |   response_output: "application/json",
              |   // resources: [UsersResource],
              | });
              |
              | server.run();
        li Run your app.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | deno --allow-net app.ts
          p <code>--allow-net</code> is required because you want to allow clients to access your network. Your server will be running on your network; therefore, access to your network must be granted. You can learn more about the <code>--allow-net</code> flag at <a href="https://deno.land/std/manual.md" target="_BLANK">https://deno.land/std/manual.md</a>.
          p When you run your app, you should see the following:
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | Deno server started at localhost:1447.
        li Make a request using <code>curl</code> like below or go to <code>localhost:1447</code> in your browser.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | curl localhost:1447
          p You should receive the following response:
          code-block-slotted(:header="false")
            template(v-slot:code)
              | {"status_code":404,"status_message":"Not Found","body":"Not Found","request":{"method":"GET","uri":"/","url_query_params":{},"url":"localhost:1447/"}}
          p You will receive a <code>404</code> error because your server does not have any resources. This is expected. You will be creating your <code>users_resources.ts</code> file in the next part.
        li Uncomment the <code>import</code> statement and <code>resources</code> config before moving on to the next part.
          code-block-slotted(language="typescript" line_highlight="3,8")
            template(v-slot:title) /path/to/your/project/app.ts
            template(v-slot:code)
              | import Drash from "https://deno.land/x/drash/mod.ts";
              |
              | import UsersResource from "./users_resource.ts";
              |
              | let server = new Drash.Http.Server({
              |   address: "localhost:1447",
              |   response_output: "application/json",
              |   resources: [UsersResource],
              | });
              |
              | server.run();
</template>
