import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import FilesResource from "./resources/files_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  response_output: "application/json",
  memory_allocation: {
    multipart_form_data: 128,
  },
  resources: [
    FilesResource,
  ],
});

Rhum.testPlan("files_resource_test.ts", () => {
  Rhum.testSuite("/files", () => {
    Rhum.testCase("multipart/form-data works", async () => {
      await runServer(server);

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
