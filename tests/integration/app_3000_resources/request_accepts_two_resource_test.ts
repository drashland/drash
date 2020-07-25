import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import RequestAcceptsTwoResource from "./resources/request_accepts_two_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  resources: [
    RequestAcceptsTwoResource,
  ],
});

Rhum.testPlan("request_accepts_two_resource_test.ts", () => {
  Rhum.testSuite("/request-accepts-two", () => {
    Rhum.testCase("accepts one and multiple types", async () => {
      await runServer(server);

      let response;

      response = await members.fetch.get(
        "http://localhost:3000/request-accepts-two",
        {
          headers: {
            Accept: "text/html;application/json",
          },
        },
      );
      members.assertEquals(
        await response.text(),
        `<div>response: text/html</div>`,
      );

      response = await members.fetch.get(
        "http://localhost:3000/request-accepts-two",
        {
          headers: {
            Accept: "application/json;text/xml",
          },
        },
      );
      members.assertEquals(
        await response.text(),
        `{"response":"application/json"}`,
      );

      response = await members.fetch.get(
        "http://localhost:3000/request-accepts-two",
        {
          headers: {
            Accept: "text/xml",
          },
        },
      );
      members.assertEquals(
        await response.text(),
        `<response>text/xml</response>`,
      );

      await server.close();
    });
  });
});

Rhum.run();
