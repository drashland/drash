<script>
export const resource = {
    paths: ["/advanced-tutorials/content-negotiation/user-profiles/part-4"],
    meta: {
        title: "Content Negotation: User Profiles",
        subtitle: "Part 4: Handling Representations",
        source_code_uri: "/advanced_tutorials/content_negotiation/user_profiles/part_4"
    }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code' + resource.meta.source_code_uri],
      part: 4,
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
      p
        strong
          em Before getting into the nitty-gritty of having your resource handle HTML representations of itself, you need to understand how the <code>Content-Type</code> header and MIME types play their roles in Drash's request-resource-response lifecycle. So, please read the entire block below.
      div.jumbotron
        p First and foremost, Drash DOES NOT use the <code>Accept</code> header to determine what representation of a resource a request wants. It uses its own <code>Response-Content-Type</code> header; and clients can only specify one content type in this header.
        p When a Drash server processes a request, it checks what content type the request wants to receive by checking the following in order:
        ul
          li Did the request specify a <code>Response-Content-Type</code> header? If so, then use that.
          li Did the request specify a <code>response_content_type</code> URL query param? If so, then use that; and do not use the header.
          li Did the request specify a <code>response_content_type</code> body param? If so, then use that; and do not use the URL query param.
          li Did the request specify a response content type at all? If not, then default to the <code>response_output</code> config that was used during the server object's creation.
          li Was the <code>response_output</code> config used? If not, then default to <code>application/json</code> (Drash's default response content type).
        p Once the server object figures out what content type to use, it sets that content type on the request as <code>request.response_content_type</code>. After the response content type is set, the server object creates the response object (<code>Drash.Http.Response</code>). The response object uses the value of <code>request.response_content_type</code> as its <code>Content-Type</code> header and uses it to decide how it should generate a response in its <code><a href="https://github.com/crookse/deno-drash/blob/master/src/http/response.ts#L68" target="_BLANK">generateResponse()</a></code> method.
        p Drash defaults to setting the response object's <code>Content-Type</code> header this way to ensure clients can properly handle Drash's response objects. For example, if a browser is the client and it receives a response with a <code>Content-Type</code> header set to <code>text/html</code>, then the browser will know that it needs to display the response as an HTML document. Same thing goes for <code>application/json</code> responses (displays as JSON), <code>application/pdf</code> responses (displays as a PDF document), etc.
        p If a request specifies a content type that is not supported in the response object (that is, a content type that is not in <code>generateResponse()</code>),then Drash will throw a <code>400 Bad Request</code> error stating that the content type the request specified is unknown.
      p Now that your server can use your users resource to serve user data, you can have your resource change the representation (the content type) of its user data before it is sent back to the client. Drash defines content types according to the MDN: <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type" target="_BLANK">https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type</a>.
      p In this tutorial part, you will create a profile card in HTML using Tailwind CSS. When clients make requests to your users resource, they will be able to specify how they want to your data. They will be able to pass in a content type using the <code>response_content_type</code> URL query param. For example, if the client wants the <code>text/html</code> representation of your users resource's data, then they can make the following <code>GET</code> request: <code>localhost:1447/users/1?response_content_type=text/html</code>.
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
          p Add your <code>profile_card.html</code> file.
          code-block(:data="example_code.user" language="html" line_highlight="14,21")
          p When a request is made to your resource for the <code>text/html</code> representation of its data, this is the HTML file that will be sent as the response. After your resource reads this HTML file, it will replace the highlighted variables (<code>alias</code> and <code>name</code>) with the requested user's data. This replacement process is basically the process a template engine would perform, but in a much simpler way.
        li
          p Modify your resource (by adding the highlighted code) so that it can generate a <code>text/html</code> representation of its data.
          code-block(:data="example_code.users_resource" language="typescript" line_highlight="12-22,37-47")
          p The highlighted code will check what content type the request wants to receive and will make sure that the user data is sent in the requested format. If the request does not specify a content type, then the server object will default to the one you specified in its <code>response_output</code> config, which should be <code>application/json</code> like below.
          code-block(:data="example_code.app" language="typescript" line_highlight="7")
  div.row
    div.col
      hr
      h2-hash Verification
      p You now have the option to specify which content type you want to receive: <code>application/json</code> or <code>text/html</code>. Verify that your resource can serve both content types of itself.
      ol
        li Run your app.
          code-block-slotted
            template(v-slot:title) /path/to/your/project/app.ts
            template(v-slot:code)
              | deno --allow-net --allow-read app.ts
        li Make a request (in another terminal session).
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | curl localhost:1447/users/1
          p You should receive the following response (we pretty-printedthe response for you):
          code-block-slotted(language="javascript")
            template(v-slot:title) Terminal
            template(v-slot:code)
              | {
              |   "status_code": 200,
              |   "status_message": "OK",
              |   "body": {
              |     "id": 1,
              |     "alias": "Captain America",
              |     "name": "Steve Rogers",
              |     "api_key": "46096ec9-5bf9-4978-b77b-07018dc32a74",
              |     "api_secret": "1b64d3ac-7e19-4018-ab99-29f50e097f4b"
              |   },
              |   "request": {
              |     "method": "GET",
              |     "uri": "/users/1",
              |     "url_query_params": {},
              |     "url": "localhost:1447/users/1"
              |   }
              | }
        li Make a request in your browser and specify that you want the <code>text/html</code> representation of <code>/users/1</code>.
          code-block-slotted(:header="false")
            template(v-slot:code)
              | localhost:1447/users/1?response_content_type=text/html
          p You should receive the following response:
          img(:src="$conf.base_url + '/public/assets/img/example_code/advanced_tutorials/content_negotiation/user_profiles/part_4/verification_3.png'")
</template>
