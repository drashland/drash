/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { Rhum } from "../deps.ts";
import { Interfaces, Request, Resource, Response, Server } from "../../mod.ts";
import { EtagService } from "../../src/services/etag/etag.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class EtagResource extends Resource {
  paths = ["/etag"];

  public GET(_request: Request, response: Response) {
    response.text("hello");
  }
}

const configs: Interfaces.IServerOptions = {
  resources: [
    EtagResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
};

const strongServer = new Server({
  ...configs,
  services: [new EtagService()],
});

const weakServer = new Server({
  ...configs,
  services: [new EtagService({ weak: true })],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("etag_test.ts", () => {
  Rhum.testSuite("GET /etag", () => {
    Rhum.testCase("Should set the header and default to strong", async () => {
      strongServer.run();
      // Example browser request
      const response = await fetch(
        `${strongServer.address}/etag`,
      );
      await strongServer.close();
      Rhum.asserts.assertEquals(await response.text(), "hello");
      const header = response.headers.get("etag") ?? "";
      Rhum.asserts.assert(header.match(/\"\d-.*\"/));
    });
    Rhum.testCase(
      "Should set the header and be weak if specified",
      async () => {
        weakServer.run();
        // Example browser request
        const response = await fetch(
          `${weakServer.address}/etag`,
        );
        await weakServer.close();
        Rhum.asserts.assertEquals(await response.text(), "hello");
        const header = response.headers.get("etag") ?? "";
        Rhum.asserts.assert(header.match(/W\/\"\d-.*\"/));
      },
    );
  });
});

Rhum.run();
