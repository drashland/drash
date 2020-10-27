import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import ViewResource from "./resources/view_resource.ts";
import { runServer } from "../test_utils.ts";

function getExpected() {
  if (Deno.build.os == "windows") {
    return "<body>      <h1>Hello Drash</h1>  </body>";
  }
  return "<body>     <h1>Hello Drash</h1> </body>";
}

const server = new Drash.Http.Server({
  directory: "./",
  resources: [
    ViewResource,
  ],
  static_paths: ["/public"],
  // TODO
  // (crookse) Figure how to get the path without having to change into the
  // directory
  views_path: "./tests/integration/app_3001_views/public/views",
  template_engine: true,
});

Rhum.testPlan("view_resource_test.ts", () => {
  Rhum.testSuite("/view", () => {
    Rhum.testCase("serves basic HTML", async () => {
      await runServer(server, { port: 3001 });

      const response = await fetch(
        "http://localhost:3001/view?data=false&file=/index.html",
        {
          method: "GET",
        },
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        getExpected(),
      );

      await server.close();
    });
  });
});

Rhum.run();
