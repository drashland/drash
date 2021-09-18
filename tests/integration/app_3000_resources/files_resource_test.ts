import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class FilesResource extends Drash.DrashResource {
  static paths = ["/files"];

  public POST() {
    this.response.body = this.request.bodyParam("value_1") ?? null;
    return this.response;
  }

  public DELETE() {
    return this.response;
  }
}

const server = new Drash.Server({
  default_response_content_type: "application/json",
  resources: [
    FilesResource,
  ],
  protocol: "http"
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
      Rhum.asserts.assertEquals(await response.text(), '"John"');

      server.close();
    });
  });
});

Rhum.run();
