/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { assertEquals } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class Res0 extends Resource {
  paths = ["/"];

  public GET(_request: Request, response: Response) {
    this.redirect("http://localhost:3000/redirect", response);
  }
}

class Res1 extends Resource {
  paths = ["/redirects-with-307"];

  public GET(_request: Request, response: Response) {
    this.redirect("http://localhost:3000/redirect", response, 307);
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
    Res0,
    Res1,
    Res2,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("redirect_test.ts", async (t) => {
  await t.step("GET /", async (t) => {
    await t.step("Should redirect to another resource", async () => {
      server.run();
      // Example browser request
      const response = await fetch(server.address);
      await server.close();
      assertEquals(await response.text(), "hello");
      assertEquals(response.status, 200);
    });
    await t.step(
      "Should respect the status code during redirection",
      async () => {
        server.run();
        // Example browser request
        const response = await fetch(server.address + "/redirects-with-307", {
          redirect: "manual",
        });
        await server.close();
        assertEquals(await response.text(), "");
        assertEquals(response.status, 307);
      },
    );
  });
});
