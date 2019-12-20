<script>
export const resource = {
    paths: ["/advanced-tutorials/content-negotiation/user-profiles/part-1"],
    meta: {
        title: "Content Negotation: User Profiles",
        subtitle: "Part 1: Simulate Database Records",
        source_code_uri: "/advanced_tutorials/content_negotiation/user_profiles/part_1"
    }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code' + resource.meta.source_code_uri],
      part: 1,
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
      p Before you start building your application, you need the data that will drive this tutorial. For simplicity, you will simulate retrieving records from a database. You will pretend that you have queried a database and retrieved three user records. This data will be parsable as JSON.
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
        li Create the <code>users.json</code> file.
          code-block(:data="example_code.users" language="javascript")
  div.row
    div.col
      hr
      h2-hash Verification (optional)
      p Since you just made a JSON file and will be parsing this file as JSON in a later part, you should test that deno can parse it as JSON.
      ol
        li Open up the deno REPL by typing in <code>deno</code> in your terminal.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | deno
              | >
        li Parse your file.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | > let fileContents = Deno.readFileSync("./users.json");
              | undefined
              |
              | > const decoder = new TextDecoder();
              | undefined
              | 
              | > let decoded = decoder.decode(fileContents);
              | undefined
              | 
              | > JSON.parse(decoded);
              | [ { id: 1, alias: "Captain America", name: "Steve Rogers", api_key: "46096ec9-5bf9-4978-b77b-07018dc32a74", api_secret: "1b64d3ac-7e19-4018-ab99-29f50e097f4b" }, { id: 2, alias: "Black Widow", name: "Natasha Romanoff", api_key: "3d93a3f9-c5ad-439d-bacb-75a9e4fb2b42", api_secret: "e5b11faa-629f-4255-bf3a-ee736dc9468d" }, { id: 3, alias: "Thor", name: "Thor Odinson", api_key: "7442f354-2a89-47ef-a3ce-5a7c68e82157", api_secret: "365e362f-fa21-4e5a-bb84-9da76e1c5f49" } ]
              | 
              | >
</template>
