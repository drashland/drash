/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { Rhum } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class Res extends Resource {
  paths = ["/"];

  public POST(request: Request, response: Response) {
    response.text(request.bodyParam("name") ?? "");
  }
}

const server = new Server({
  resources: [
    Res,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("posting_invlaid_json_test.ts", () => {
  Rhum.testSuite("POST /", () => {
    Rhum.testCase("Should return error when json body is invalid", async () => {
      server.run();
      const response = await fetch(
        server.address,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: '{"name": "ed"}},,',
        },
      );
      console.log(response);
      await server.close();
      Rhum.asserts.assertEquals(
        (await response.text()).startsWith(
          "Error: Unprocessable entity. The request body seems to be invalid as there was an error parsing it",
        ),
        true,
      );
      Rhum.asserts.assertEquals(
        response.status,
        422,
      );
    });
  });
});

Rhum.run();
