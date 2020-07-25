import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import {Drash} from "../../../mod.ts";
import TemplateEngineNullDataResource from "./resources/template_engine_null_data_resource.ts";
import {runServer} from "../test_utils.ts";

function getExpected() {
  if (Deno.build.os == "windows") {
    return `<!DOCTYPE html>  <html class=\"h-full w-full\">    <head>      <meta charset=\"utf-8\"/>      <meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, user-scalable=no\"/>      <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css\">      <title>Skills</title>    </head>    <body>          <div style=\"max-width: 640px; margin: 50px auto;\">    <h1 class=\"text-5xl\">Thor</h1>  </div>      </body>  </html>  `;
  }
  return `<!DOCTYPE html> <html class=\"h-full w-full\">   <head>     <meta charset=\"utf-8\"/>     <meta name=\"viewport\" content=\"width=device-width, minimum-scale=1.0, user-scalable=no\"/>     <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css\">     <title>Skills</title>   </head>   <body>       <div style=\"max-width: 640px; margin: 50px auto;\">   <h1 class=\"text-5xl\">Thor</h1> </div>    </body> </html> `;
}

const server = new Drash.Http.Server({
  resources: [
    TemplateEngineNullDataResource,
  ],
  static_paths: ["/public"],
  // TODO
  // (crookse) Figure how to get the path without having to change into the
  // directory
  views_path: "./tests/integration/app_3001_views/public/views",
  template_engine: true,
});

Rhum.testPlan("template_engine_null_data_resource_test.ts", () => {
  Rhum.testSuite("/template-engine-null-data", () => {
    Rhum.testCase("handles null data", async () => {
      await runServer(server, { port: 3001 })

      let response;

      response = await members.fetch.get(
        "http://localhost:3001/template-engine-null-data",
      );
      const text = await response.text();
      Rhum.asserts.assertEquals(
        text,
        getExpected(),
      );

      await server.close()
    });
  });
});

Rhum.run();
