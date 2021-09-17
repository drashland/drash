import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class FilesResource extends Drash.Resource {
  static paths = ["/files"];

  public async POST() {
    this.response.body = this.request.getBodyParam("value_1") ?? null;
    return this.response;
  }

  public DELETE() {
    return this.response;
  }
}

const server = new Drash.Server({
  response_output: "application/json",
  resources: [
    FilesResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("files_resource_test.ts", () => {
  Rhum.testSuite("/files", () => {
    Rhum.testCase("multipart/form-data works", async () => {
      await TestHelpers.runServer(server);

      let response;

      let formData = new FormData();
      formData.append("value_1", "John");

      response = await fetch("http://localhost:3000/files", {
        method: "POST",
        body: formData,
      });
      Rhum.asserts.assertEquals(await response.text(), '"John"');

      await server.close();
    });
  });
});

Rhum.run();
