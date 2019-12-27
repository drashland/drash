<script>
export const resource = {
  paths: ["/tutorials/serving-static-paths"],
  meta: {
    title: "Serving Static Paths",
    source_code_uri: "/tutorials/serving_static_paths"
  }
}

export default {
  data() {
    return {
      data: {
        example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/serving_static_paths'],
        example_code_public: this.$app_data.example_code['/docs/src/example_code/tutorials/serving_static_paths/public'],
        toc: {
          items: [
            "Before You Get Started",
            "Folder Structure End State",
            "Steps",
            "Verification"
          ]
        }
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
        h2#before-you-get-started Before You Get Started
        ul
          li In this tutorial, you will build a very simple HTML page that can serve a CSS file.
          list-item-download-source-code(:source_code_uri="$route.meta.source_code_uri")
    div.row
      div.col
        hr
        h2#folder-structure-end-state Folder Structure End State
        ul
          li Upon completing this tutorial, your project's folder structure should look similar to:
            code-block(:data="data.example_code.folder_structure")
    div.row
      div.col
        hr
        h2#steps Steps
        ol
          li Create your app file.
            code-block(:data="data.example_code.app" line_highlight="7,10")
            p The <code>static_paths</code> config tells your Drash server what paths on your filesystem contain static files that can be served to clients. Ultimately, your Drash server will prefix the <code>directory</code> config with your paths in your <code>static_paths</code> config. For example, your Drash server will take a request to <code>/public/assets/css/style.css</code> and resolve it to <code>{directory_config}/public/assets/css/style.css</code>.
          li Create your <code>style.css</code> file in your static directory.
            code-block(:data="data.example_code_public.style" title="/path/to/your/project/public/style.css")
          li Create your resource file.
            code-block(:data="data.example_code.home_resource")
            p Your resource file will serve HTML; and your HTML will reference <code>style.css</code>.
    div.row
      div.col
        hr
        h2#verification Verification
        ol
          li Run your app.
            code-block-slotted
              template(v-slot:title) Terminal
              template(v-slot:code)
                | deno --allow-net --allow-read app.ts
            p-deno-flag-allow-net
            p-deno-flag-allow-read-static
            p You should receive the following response:
            a(href="/deno-drash/public/assets/img/serving_static_paths.png")
              img(:src="$conf.base_url + '/public/assets/img/example_code/tutorials/serving_static_paths/verification_1.png'")
</template>
