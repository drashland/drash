import { Rhum, TestHelpers } from "../deps.ts";
import { Errors, Response, Server, Service } from "../../mod.ts";
import { ErrorsToJsonService } from "../../src/services/errors_to_json/errors_to_json.ts";

const server = new Server({
  protocol: "http",
  hostname: "localhost",
  port: 3000,
  resources: [],
  services: [new ErrorsToJsonService()]
});

Rhum.testPlan("errors_to_json_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("Error is json", async () => {
      server.run();
      const res = await TestHelpers.makeRequest.get(server.address);
      await server.close();

      Rhum.asserts.assertEquals(res.status, 404);
      Rhum.asserts.assertEquals(await res.json(), {code: 404, message: "Not Found"});
    });
  });
});

Rhum.run();
