<template lang="pug">
page-tutorial(
  :toc="toc"
)
  div.row
    div.col
      hr
      h2-hash Before You Get Started
      p A global member is any "thing" you define the global member to be. It can be a service, an app, an array, a number, etc.
      p You can add global members to the <code>Drash.Members</code> namespace via <code>Drash.addMember()</code>.
      p Adding global members is helpful when you want to access a "thing" without having to remember where it's physically located. This prevents you from having to import like <code>import MyThing from "../path/../to/../some/../dir/my_thing.ts"</code>. Instead, you can add your "thing" as a global member (e.g., <code>Drash.addMember("MyThing", myThing);</code>) and access it like <code>Drash.Members.MyThing</code>.
      p All global members are added to the <code>Drash.Members</code> namespace.
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
        li Create your "thing" to be added as a global member.
          code-block(:data="example_code.my_thing")
        li Create a file that adds your "thing" as a global member.
          code-block(:data="example_code.bootstrap")
        li Create your app file and have it use your global member.
          code-block(:data="example_code.app")
  div.row
    div.col
      hr
      h2-hash Verification
      ol
        li Run your app.
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | deno app.ts
          p You should see the following after you have run your app:
          code-block-slotted
            template(v-slot:title) Terminal
            template(v-slot:code)
              | Hello from MyThing!
          p As you can see, <code>app.ts</code> knows nothing about <code>MyThing</code>. All it knows is that it should be registered as a global member and that it can use it without having to import it.
</template>

<script>
export const resource = {
  paths: ["/tutorials/misc/adding-global-members"],
  meta: {
    title: "Adding Global Members",
  }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/misc/adding_global_members'],
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

