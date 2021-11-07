/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { Rhum } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";
import { TengineService } from "../../src/services/tengine/tengine.ts";

const tengine = new TengineService({
  views_path: "./tests/data/views",
  render: (..._args: unknown[]) => false,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class TengineResource extends Resource {
  paths = ["/tengine"];

  services = {
    "GET": [tengine],
  };

  public GET(_request: Request, response: Response) {
    response.html(response.render("/tengine_index.html", {
      greeting: "Gday",
    }) as string);
  }
}

const server = new Server({
  resources: [
    TengineResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("tengine_test.ts", () => {
  Rhum.testSuite("GET /tengine", () => {
    Rhum.testCase("Tengine should handle the request", async () => {
      server.run();
      const res = await fetch(`${server.address}/tengine`);
      await server.close();
      Rhum.asserts.assertEquals(res.headers.get("content-type"), "text/html");
      Rhum.asserts.assertEquals(await res.text(), "Gday ");
    });
  });
});

Rhum.run();
