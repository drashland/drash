import { assertEquals } from "../../deps.ts";
import { Server } from "../../../src/http/server.ts";
import { Request, Resource, Response } from "../../../mod.ts";

class HomeResource extends Resource {
  paths = ["/"];
  public GET(_request: Request, response: Response) {
    response.json({
      success: true,
    });
  }
  public POST(request: Request, response: Response) {
    response.text(request.bodyParam("name") ?? "No body param passed in.");
  }
}

const server = new Server({
  port: 1234,
  resources: [HomeResource],
  protocol: "http",
  hostname: "localhost",
});

Deno.test("http/server_test.ts", async (t) => {
  await t.step("address", async (t) => {
    await t.step("Should correctly format the address", () => {
      const server1 = new Server({
        protocol: "https",
        hostname: "hosty",
        port: 1234,
        resources: [HomeResource],
      });
      const server2 = new Server({
        port: 1234,
        resources: [HomeResource],
        protocol: "http",
        hostname: "ello",
      });
      server1.close();
      server2.close();
      assertEquals(server1.address, "https://hosty:1234");
      assertEquals(server2.address, "http://ello:1234");
    });
  });

  await t.step("close()", async (t) => {
    await t.step("Closes the server", async () => {
      server.run();
      // can connect
      const conn = await Deno.connect({
        hostname: "localhost",
        port: 1234,
      });
      conn.close();
      // and then close
      await server.close();
      let errorThrown = false;
      try {
        await Deno.connect({
          hostname: "localhost",
          port: 1234,
        });
      } catch (_e) {
        errorThrown = true;
      }
      assertEquals(errorThrown, true);
    });
  });

  await t.step("run()", async (t) => {
    await t.step(
      "Will listen correctly and send the proper response",
      async () => {
        server.run();
        const res = await fetch("http://localhost:1234", {
          headers: {
            Accept: "application/json",
          },
        });
        await server.close();
        assertEquals(await res.json(), {
          success: true,
        });
        assertEquals(res.status, 200);
      },
    );
    await t.step(
      "Will throw a 404 if no resource found matching the uri",
      async () => {
        server.run();
        const res = await fetch("http://localhost:1234/dont/exist");
        await res.text();
        await server.close();
        assertEquals(res.status, 404);
      },
    );
    await t.step(
      "Will throw a 405 if the req method isnt found on the resource",
      async () => {
        server.run();
        const res = await fetch("http://localhost:1234", {
          method: "OPTIONS",
        });
        await res.text();
        await server.close();
        assertEquals(res.status, 405);
      },
    );
    await t.step(
      "Will parse the body if it exists on the request",
      async () => {
        server.run();
        const res = await fetch("http://localhost:1234", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
          body: JSON.stringify({ name: "Drash" }),
        });
        await server.close();
        assertEquals(await res.text(), "Drash");
        assertEquals(res.status, 200);
      },
    );
  });
});
