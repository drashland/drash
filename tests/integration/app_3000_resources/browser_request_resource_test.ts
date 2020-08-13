/**
 * This test addresses an issue where someone on the discord
 * had their default content type set, but on  browser requests
 * the response  was "null". This is because originally, the response
 * class didn't fully take into account the config AND the accept headers.
 * Essentially meaning, returning text/html (as this was the first type
 * on the request)
 */

import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import BrowserRequestResource from "./resources/browser_request_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  response_output: "application/json",
  resources: [
    BrowserRequestResource,
  ],
});

Rhum.testPlan("browser_request_resource.ts", () => {
  Rhum.testSuite("GET /browser-request", () => {
    Rhum.testCase("Response should be JSON", async () => {
      await runServer(server);

      // Example browser request
      const response = await members.fetch.get(
        "http://localhost:3000/browser-request",
        {
          headers: {
            "Accept":
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          },
        },
      );
      Rhum.asserts.assertEquals(await response.text(), "{}"); // would be null
      Rhum.asserts.assertEquals(
        response.headers.get("Content-Type"),
        "application/json",
      );

      await server.close();
    });
  });
});

Rhum.run();
