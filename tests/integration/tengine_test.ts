/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { assertEquals } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";
import { TengineService } from "../../src/services/tengine/tengine.ts";

const tengine = new TengineService({
  views_path: "./tests/data/views",
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

Deno.test("tengine_test.ts", async (t) => {
  await t.step("GET /tengine", async (t) => {
    await t.step("Tengine should handle the request", async () => {
      server.run();
      const res = await fetch(`${server.address}/tengine`);
      await server.close();
      assertEquals(res.headers.get("content-type"), "text/html");
      assertEquals(await res.text(), "Gday");
    });
  });
});
