<script>
export const resource = {
  paths: ["/third-party-tutorials/databases/deno-mysql"],
  meta: {
    title: "deno_mysql",
    source_code_uri: "/third_party_tutorials/databases/deno_mysql"
  }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code/third_party_tutorials/databases/deno_mysql'],
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
      p In this tutorial, you will create a very basic server that connects to a database using <a href="https://github.com/manyuanrong/deno_mysql" target="_BLANK">deno_mysql</a>.
      p This tutorial will be written using the following database:
      p
        code-block-slotted
          template(v-slot:title) database: deno_mysql
          template(v-slot:code)
            | +------+------+
            | | name | sex  |
            | +------+------+
            | | eric | m    |
            | +------+------+
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
          p Your resource will use deno_mysql to make a query to the database&ndash;getting all user records from the database.
        li Create your app file.
          code-block(:data="example_code.app")
          p Your resource file is expecting <code>denoMysql</code>; therefore, your app file will need to <code>export</code> it.
  div.row
    div.col
      hr
      h2-hash Verification
      ol
        li Run your app.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | deno --allow-net --allow-write app.ts
          p-deno-flag-allow-net
          p <code>--allow-write</code> is required because deno_mysql will write to a <code>mysql.log</code> file in the event it needs to (e.g., when errors are thrown); therefore, write access must be granted.
        li Make a request using <code>curl</code> like below or go to <code>localhost:1447/</code> in your browser.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | curl localhost:1447/
          p You should receive the following response (we pretty-printed the response for you):
          code-block-slotted(:header="false" language="javascript")
            template(v-slot:code)
              | [
              |   {
              |     "name": "eric",
              |     "sex": "m"
              |   }
              | ]
