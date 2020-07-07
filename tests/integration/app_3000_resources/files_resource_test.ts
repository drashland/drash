import members from "../../members.ts";
import { Rhum } from "../../deps.js";

Rhum.testPlan("files_resource_test.ts", () => {
  Rhum.testSuite("/files", () => {
    Rhum.testCase("multipart/form-data works", async () => {
      let response;

      let formData = new FormData();
      formData.append("value_1", "John");

      response = await fetch("http://localhost:3000/files", {
        method: "POST",
        body: formData,
      });
      Rhum.asserts.assertEquals(await response.text(), '"John"');
    });
  });
});

Rhum.run();
