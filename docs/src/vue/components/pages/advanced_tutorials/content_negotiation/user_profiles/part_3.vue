<script>
export const resource = {
    paths: ["/advanced-tutorials/content-negotiation/user-profiles/part-3"],
    meta: {
        title: "Content Negotation: User Profiles",
        subtitle: "Part 3: Creating The Resource",
        source_code_uri: "/advanced_tutorials/content_negotiation/user_profiles/part_3"
    }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code' + resource.meta.source_code_uri],
      part: 3,
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
)
  div.row
    div.col
      hr
      h2-hash Before You Get Started
      p Your server will not be able to handle requests for your user records until you give it a resource that grants clients access to your user records. In Part 2, you made your server expect the <code>users_resource.ts</code> file. You will create this file next and make sure your server runs properly with it in the Verification section.
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
          p Create your users resource file.
          code-block(:data="example_code.users_resource" language="typescript")
          p Your resource will only handle <code>GET</code> requests at the following URIs:
          ul
            li
              code /users/:id
            li
              code /users/:id/
          p Note that the above URIs are different. <em>Drash does not automatically append a trailing slash to the paths you specify. You must be explicit in this regard.</em>
          p When a <code>GET</code> request is made to the above URIs, your resource will handle the request by:
          ol
            li Checking if an <code>id</code> path param was specified in the URI (e.g., if the request was to <code>/users/1</code>, then <code>1</code> would be the <code>id</code>).
            li Using the <code>id</code> path param to match it to a user's ID in your user records; and
            ul
              li setting the user's record in the body of the response if the <code>id</code> path param is matched; or
              li throwing a <code>404 Not Found</code> error with <code>User not found.</code> as the response body if the <code>id</code> path param is not matched.
            li Sending the response back to the server object for further processing back to the client that made the request.
  div.row
    div.col
      hr
      h2-hash Verification
      p Stop your server (<code>ctrl + c</code>) if you still have it running from Part 2. Now that you have the resource file that your server is expecting, you can start your server and make a <code>GET</code> request to one of your resource's URIs.
      ol
        li Run your app.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | deno --allow-net --allow-read app.ts
          p This time, your app requires two flags to run. You already know what the <code>--allow-net</code> flag does from Part 2. <code>--allow-read</code> is required because your resource requires read access to read your <code>users.json</code> file. You can learn more about the <code>--allow-read</code> flag at <a href="https://deno.land/std/manual.md" target="_BLANK">https://deno.land/std/manual.md</a>.
        li Make a request using <code>curl</code> like below or go to <code>localhost:1447</code> in your browser.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | curl localhost:1447/users/1
          p You should receive the following response (we pretty-printed the response for you):
          code-block-slotted(:header="false" language="javascript")
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
        li Make another request.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | curl localhost:1447/users/2
          p You should receive the following response (we pretty-printed the response for you):
          code-block-slotted(:header="false" language="javascript")
            template(v-slot:code)
              | {
              |   "status_code": 200,
              |   "status_message": "OK",
              |   "body": {
              |     "id": 2,
              |     "alias": "Black Widow",
              |     "name": "Natasha Romanoff",
              |     "api_key": "3d93a3f9-c5ad-439d-bacb-75a9e4fb2b42",
              |     "api_secret": "e5b11faa-629f-4255-bf3a-ee736dc9468d"
              |   },
              |   "request": {
              |     "method": "GET",
              |     "uri": "/users/2",
              |     "url_query_params": {},
              |     "url": "localhost:1447/users/2"
              |   }
              | }
        li Make a bad request.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | curl localhost:1447/users/4
          p You should receive the following response (we pretty-printed the response for you):
          code-block-slotted(:header="false" language="javascript")
            template(v-slot:code)
              | {
              |   "status_code": 404,
              |   "status_message": "Not Found",
              |   "body": "User not found",
              |   "request": {
              |     "method": "GET",
              |     "uri": "/users/4",
              |     "url_query_params": {},
              |     "url": "localhost:1447/users/4"
              |   }
              | }
</template>
