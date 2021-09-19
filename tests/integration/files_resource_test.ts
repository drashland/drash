import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"
import { IContext, Resource } from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class FilesResource extends Resource {
  static paths = ["/files"];

  public POST(context: IContext) {
    context.response.body = context.request.bodyParam("value_1") ?? null;
  }
}

const server = new Drash.Server({
  default_response_type: "application/json",
  resources: [
    FilesResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("files_resource_test.ts", () => {
  Rhum.testSuite("/files", () => {
    Rhum.testCase("multipart/form-data works", async () => {
      server.run();

      let response;

      let formData = new FormData();
      formData.append("value_1", "John");

      response = await fetch("http://localhost:3000/files", {
        method: "POST",
        body: formData,
      });
      Rhum.asserts.assertEquals(await response.text(), 'John');

      server.close();
    });
  });
});

Rhum.run();
