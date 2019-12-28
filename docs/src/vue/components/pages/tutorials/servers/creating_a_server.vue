<script>
export const resource = {
  paths: ["/tutorials/servers/creating-a-server"],
  meta: {
    title: "Creating A Server",
    source_code_uri: "/tutorials/servers/creating_a_server"
  }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/servers/creating_a_server'],
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
      p In this tutorial, you will create a very basic server that handles some common requests: <code>GET</code>, <code>POST</code>, <code>PUT</code>, and <code>DELETE</code>.
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
          code-block(:data="example_code.home_resource")
          p Your resource file will be able to handle <code>GET</code>, <code>POST</code>, <code>PUT</code>, and <code>DELETE</code> requests to the <code>/</code> URI.
        li Create your app file.
          code-block(:data="example_code.app")
          p Your app file will register your resource via the <code>resources</code> config.
          p By default, your Drash server will send <code>application/json</code> responses via the <code>resposne_output</code>. More information about using this config can be found in the Content Negotiation tutorial.
  div.row
    div.col
      hr
      h2-hash Verification
      ol
        li Run your app.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | deno --allow-net app.ts
          p-deno-flag-allow-net
        li Using Postman (or similar app), make a <code>GET</code> request to <code>localhost:1447</code>.
          p You should receive the following response:
          a(href="/deno-drash/public/assets/img/example_code/tutorials/creating_a_server/verification_1.png")
            img(:src="$conf.base_url + '/public/assets/img/example_code/tutorials/creating_a_server/verification_1.png'")
        li Make a <code>PUT</code> request.
          p You should receive the following response:
          a(href="/deno-drash/public/assets/img/example_code/tutorials/creating_a_server/verification_2.png")
            img(:src="$conf.base_url + '/public/assets/img/example_code/tutorials/creating_a_server/verification_2.png'")
        li Make a <code>POST</code> request.
          p You should receive the following response:
          a(href="/deno-drash/public/assets/img/example_code/tutorials/creating_a_server/verification_3.png")
            img(:src="$conf.base_url + '/public/assets/img/example_code/tutorials/creating_a_server/verification_3.png'")
        li Make a <code>DELETE</code> request.
          p You should receive the following response:
          a(href="/deno-drash/public/assets/img/example_code/tutorials/creating_a_server/verification_4.png")
            img(:src="$conf.base_url + '/public/assets/img/example_code/tutorials/creating_a_server/verification_4.png'")
        li Make a <code>PATCH</code> request.
          p Since <code>PATCH</code> is not defined in your resource, it is not allowed; therefore, you should receive the following response:
          a(href="/deno-drash/public/assets/img/example_code/tutorials/creating_a_server/verification_5.png")
            img(:src="$conf.base_url + '/public/assets/img/example_code/tutorials/creating_a_server/verification_5.png'")
