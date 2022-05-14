import { assertEquals } from "../../deps.ts";
import {
  IResource,
  Request,
  Resource,
  Response,
  Server,
} from "../../../mod.ts";
import { CORSService } from "../../../src/services/cors/cors.ts";

class FailedOptionCORSMiddlewareResource extends Resource implements IResource {
  paths = ["/cors"];
  public GET(_request: Request, response: Response) {
    response.text("GET request received!");
  }
  public OPTIONS(_request: Request, response: Response) {
    response.headers.set("content-type", "text/plain");
  }
}

function runServer(allowAll = true): Server {
  const cors = allowAll
    ? new CORSService()
    : new CORSService({ origin: "localhost" });
  const server = new Server({
    services: [cors],
    resources: [
      FailedOptionCORSMiddlewareResource,
    ],
    port: 1447,
    hostname: "127.0.0.1",
    protocol: "http",
  });
  server.run();
  return server;
}

Deno.test("cors/tests/mod_test.ts", async (t) => {
  // Also covers unit tests
  await t.step("Integration", async (t) => {
    await t.step("Should shortcircuit preflight requests", async () => {
      const server = runServer();
      const response = await fetch("http://localhost:1447/cors", {
        method: "OPTIONS",
        headers: {
          "Origin": "localhost",
          "Access-Control-Request-Method": "GET",
          Accept: "text/plain",
        },
      });
      assertEquals(
        response.status,
        204,
      );
      assertEquals(
        response.headers.get("access-control-allow-origin"),
        "*",
      );
      assertEquals(
        response.headers.get("access-control-allow-methods"),
        "GET,HEAD,PUT,PATCH,POST,DELETE",
      );
      assertEquals(
        response.headers.get("vary"),
        "Accept-Encoding, origin",
      );
      assertEquals(response.headers.get("content-length"), null);
      await server.close();
    });
    await t.step("Should always set the vary header", async () => {
      const server = runServer();
      const response = await fetch("http://localhost:1447/cors", {
        method: "OPTIONS",
        headers: {
          "Origin": "localhost",
          "Access-Control-Request-Method": "GET",
          Accept: "text/plain",
        },
      });
      await server.close();
      assertEquals(
        response.headers.get("vary"),
        "Accept-Encoding, origin",
      );
    });
    await t.step(
      "Only sets the vary header if Origin header is not set",
      async () => {
        const server = runServer();
        const response = await fetch("http://localhost:1447/cors", {
          method: "OPTIONS",
          headers: {
            "Access-Control-Request-Method": "GET",
            Accept: "text/plain",
          },
        });
        await response.arrayBuffer();
        await server.close();
        assertEquals(
          response.headers.get("vary"),
          "Accept-Encoding, origin",
        );
        assertEquals(
          response.headers.get("access-control-allow-origin"),
          null,
        );
        assertEquals(
          response.headers.get("access-control-allow-methods"),
          null,
        );
      },
    );
    await t.step(
      "Should not allow request when origins do not match",
      async () => {
        const server = runServer(false);
        const response = await fetch("http://localhost:1447/cors", {
          method: "OPTIONS",
          headers: {
            "Origin": "the big bang",
            "Access-Control-Request-Method": "GET",
            Accept: "text/plain",
          },
        });
        await response.arrayBuffer();
        await server.close();
        assertEquals(
          response.headers.get("vary"),
          "Accept-Encoding, origin",
        );
        assertEquals(
          response.headers.get("access-control-allow-origin"),
          null,
        );
      },
    );
    await t.step(
      "Sets Allow Headers header when Request Header header is set",
      async () => {
        const server = runServer(false);
        const response = await fetch("http://localhost:1447/cors", {
          method: "OPTIONS",
          headers: {
            "Origin": "localhost",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "hello world",
            Accept: "text/plain",
          },
        });
        await response.arrayBuffer();
        await server.close();
        assertEquals(
          response.headers.get("access-control-allow-headers"),
          "hello world",
        );
      },
    );
    await t.step(
      "Realworld example - CORS not enabled for request",
      async () => {
        // Failed request - access control header is not present
        const server = runServer(false);
        const res = await fetch("http://localhost:1447", {
          method: "GET",
          headers: {
            Origin: "https://google.com",
            Accept: "text/plain",
          },
        });
        await res.text();
        await server.close();
        assertEquals(
          res.headers.get("access-control-allow-origin"),
          null,
        );
      },
    );
    await t.step(
      "Realworld example - CORS enabled for a single origin",
      async () => {
        // Successful request - access control header is present and the value of the origin
        const server = runServer(false);
        const res = await fetch("http://localhost:1447/cors", {
          method: "GET",
          headers: {
            Origin: "localhost",
            Accept: "text/plain", // As server two is setting cors origin as localhost
          },
        });
        await res.text();
        await server.close();
        assertEquals(
          res.headers.get("access-control-allow-origin"),
          "localhost",
        );
      },
    );
    await t.step(
      "Realworld example - CORS enabled for every origin",
      async () => {
        // Another successful request, but the origin allows anything
        const server = runServer(true);
        const res = await fetch("http://localhost:1447/cors", {
          method: "GET",
          headers: {
            Origin: "https://anything.com",
            Accept: "text/plain",
          },
        });
        await res.text();
        await server.close();
        assertEquals(
          res.headers.get("access-control-allow-origin"),
          "*",
        );
      },
    );
  });
});
