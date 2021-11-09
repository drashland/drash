/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { delay, Rhum } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";
import { ResponseTimeService } from "../../src/services/response_time/response_time.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class ResponseTimeResource extends Resource {
  paths = ["/response-time"];

  public async GET(_request: Request, response: Response) {
    await delay(400);
    response.text("hello");
  }
}

const server = new Server({
  resources: [
    ResponseTimeResource,
  ],
  services: [new ResponseTimeService()],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("response_time_test.ts", () => {
  Rhum.testSuite("GET /response-time", () => {
    Rhum.testCase("Should set the response time header", async () => {
      server.run();
      // Example browser request
      const response = await fetch(
        `${server.address}/response-time`,
      );
      await response.text();
      await server.close();
      const value = response.headers.get("x-response-time") ?? "";
      Rhum.asserts.assert(value.match(/\d\d\dms/));
    });
  });
});

Rhum.run();
