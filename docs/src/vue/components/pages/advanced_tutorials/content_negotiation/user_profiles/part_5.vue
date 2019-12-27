<script>
export const resource = {
    paths: ["/advanced-tutorials/content-negotiation/user-profiles/part-5"],
    meta: {
        title: "Content Negotation: User Profiles",
        subtitle: "Part 5: Further Customization",
        source_code_uri: "/advanced_tutorials/content_negotiation/user_profiles/part_5"
    }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code' + resource.meta.source_code_uri],
      part: 5,
      parts: 5,
      toc: {
        items: [
          "Before You Get Started",
          "Folder Structure End State",
          "Steps",
          "Verification",
        ]
      },
      uri: "/advanced-tutorials/content-negotiation/user-profiles",
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
  :end="true"
)
  div.row
    div.col
      hr
      h2-hash Before You Get Started
      p Out of the box, Drash's response object supports the following content types:
      ul
        li <code>application/json</code>
        li <code>text/html</code>
        li <code>application/xml</code>
        li <code>text/xml</code>
      p Sometimes you will have clients that want to request content types of your resources other than the ones listed above. If you ever need Drash's response object to support more content types, then you will need to override and replace <code>Drash.Http.Response</code>.
      p In this tutorial part, you will override and replace <code>Drash.Http.Response</code> so that it can send the content types listed above and <code>text/plain</code>.
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
          p Create your <code>response.ts</code> file that will be used to override <code>Drash.Http.Response</code>.
          code-block(:data="example_code.response" language="typescript" line_highlight="13")
          p The only method you need to override to add more content types is <code>generateResponse()</code>. As you can see, the only item that was added was <code>text/plain</code> to the list of content types.
        li
          p Import your <code>response.ts</code> file and replace <code>Drash.Http.Response</code> in your <code>app.ts</code>.
          code-block(:data="example_code.app" language="typescript" line_highlight="3-4")
          p Now, when your Drash server runs, it will use your response class instead of its original <code>Drash.Http.Response</code>.
        li
          p Support <code>text/plain</code>, <code>application/xml</code>, and <code>text/xml</code> in your <code>users_resource.ts</code> file.
          code-block(:data="example_code.users_resource" language="typescript" line_highlight="22-28, 66-80")
  div.row
    div.col
      hr
      h2-hash Verification
      p Now that you have your resource can properly serve multiple content types, you can restart your server and make <code>GET</code> requests for each content type.
      ol
        li Run your app.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | deno --allow-net --allow-read app.ts
        li Make a request in your browser and specify that you want the <code>text/html</code> representation of <code>/users/1</code>.
          code-block-slotted(:header="false")
            template(v-slot:code)
              | localhost:1447/users/1?response_content_type=text/html
          p You should receive the following response:
          img(:src="$conf.base_url + '/public/assets/img/example_code/advanced_tutorials/content_negotiation/user_profiles/part_5/verification_2.png'")
        li Make a request in your browser and specify that you want the <code>application/xml</code> representation of <code>/users/2</code>.
          code-block-slotted(:header="false")
            template(v-slot:code)
              | localhost:1447/users/2?response_content_type=application/xml
          p You should receive the following response:
          img(:src="$conf.base_url + '/public/assets/img/example_code/advanced_tutorials/content_negotiation/user_profiles/part_5/verification_3.png'")
        li Make a request in your browser and specify that you want the <code>text/plain</code> representation of <code>/users/3</code>.
          code-block-slotted(:header="false")
            template(v-slot:code)
              | localhost:1447/users/3?response_content_type=text/plain
          p You should receive the following response:
          img(:src="$conf.base_url + '/public/assets/img/example_code/advanced_tutorials/content_negotiation/user_profiles/part_5/verification_4.png'")
</template>
