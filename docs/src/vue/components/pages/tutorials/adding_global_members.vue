<template lang="pug">
div
    div.c-page__header
        div.row
            div.col
                h1.c-heading.c-heading--style-2 {{ $route.meta.title }}
    hr
    div.c-page__body
        div.row
            div.col
                h3 Before you get started
                ul
                    li A global member is any "thing" you define the global member to be. It can be a service, an app, an array, a number, etc.
                    li You can add global members to the <code>Drash.Members</code> namespace via <code>Drash.addMember()</code>.
                    li Adding global members is helpful when you want to access a "thing" without having to remember where it's physically located. This prevents you from having to import like <code>import MyThing from "../path/../to/../some/../dir/my_thing.ts"</code>. Instead, you can add your "thing" as a global member, open up another file, import Drash and access your member via <code>Drash.Members.MyThing</code>.
                    li All global members are added to the <code>Drash.Members</code> namespace.
                    li You can download the source code for this tutorial here.
                h3 Folder Structure End State
                ul
                    li Upon completing this tutorial, your project's folder structure should look similar to:
                        code-block(:data="example_code.folder_structure")
                h3 Steps
                ol
                    li Perform the initial setup of your project.
                        code-block(:data="example_code.folder_structure_setup")
                    li Create your "thing" to be added as a global member.
                        code-block(:data="example_code.my_thing")
                    li Create the file that adds your "thing" as a global member.
                        code-block(:data="example_code.bootstrap")
                    li Create your app file.
                        ul
                            li This is the file that will be passed to the <code>deno</code> command in the terminal.
                            li This file will call the <code>greet()</code> method from the global member <code>MyThing</code>, which should output <code>Hello from MyThing!</code>.
                        code-block(:data="example_code.app" line_highlight="5")
                    li Run your app.
                        div.b-code-example
                            pre.header
                                code.header Terminal
                            pre.body
                                code.language-shell deno /path/to/your/project/app.ts
                        p When you start your app, you should see the following in the terminal:
                        div.b-code-example
                            pre.header
                                code.header Terminal
                            pre.body
                                code.language-text
                                    | Hello from MyThing!
                p.text--help This is the end of this tutorial.
</template>

<script>
export const resource = {
    paths: ["/tutorials/adding-global-members"],
    meta: {
        title: "Adding Global Members",
    }
}

export default {
    data() {
        return {
            example_code: this.$app_data.example_code.tutorials.adding_global_members
        };
    },
}
</script>

