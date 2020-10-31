import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import InvalidReturningOfResponseResource from "./resources/returning_invalid_response_in_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  resources: [
    InvalidReturningOfResponseResource,
  ],
});

Rhum.testPlan("coffee_resource_test.ts", () => {
  Rhum.testSuite("/invalid/returning/of/response", () => {
    Rhum.testCase("Error is thrown when nothing is returned", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/invalid/returning/of/response",
      );
      await server.close();

      Rhum.asserts.assertEquals(
        await response.text(),
        '"The response must be returned inside the InvalidReturningOfResponseResource.GET method of the resource"',
      );
      Rhum.asserts.assertEquals(response.status, 418);
    });
    Rhum.testCase("Error is thrown when nothing is returned", async () => {
      await runServer(server);

      const response = await members.fetch.post(
        "http://localhost:3000/invalid/returning/of/response",
      );
      await server.close();

      Rhum.asserts.assertEquals(
        await response.text(),
        '"The response must be returned inside the InvalidReturningOfResponseResource.POST method of the resource"',
      );
      Rhum.asserts.assertEquals(response.status, 418);
    });
  });
});

Rhum.run();
