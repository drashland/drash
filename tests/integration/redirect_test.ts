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

  public GET(_request: Request, response: Response) {
    this.redirect("http://localhost:3000/redirect", response);
  }
}

class Res2 extends Resource {
  paths = ["/redirect"];

  public GET(_request: Request, response: Response) {
    response.text("hello");
  }
}

const server = new Server({
  resources: [
    Res,
    Res2,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("redirect_test.ts", () => {
  Rhum.testSuite("GET /", () => {
    Rhum.testCase("Should redirect to another resource", async () => {
      server.run();
      // Example browser request
      const response = await fetch(server.address);
      await server.close();
      Rhum.asserts.assertEquals(await response.text(), "hello");
      Rhum.asserts.assertEquals(response.status, 200);
    });
  });
});

Rhum.run();
