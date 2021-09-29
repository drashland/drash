import { Rhum } from "../../deps.ts";
import {
  IResource,
  Request,
  Resource,
  Response,
  Server,
} from "../../../mod.ts";
import { CorsService } from "../../../src/services/cors/cors.ts";

class FailedOptionCorsMiddlewareResource extends Resource implements IResource {
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
    ? new CorsService()
    : new CorsService({ origin: "localhost" });
  const server = new Server({
    services: [cors],
    resources: [
      FailedOptionCorsMiddlewareResource,
    ],
    port: 1447,
    hostname: "127.0.0.1",
    protocol: "http",
  });
  server.run();
  return server;
}

Rhum.testPlan("cors/tests/mod_test.ts", () => {
  // Also covers unit tests
  Rhum.testSuite("Integration", () => {
    Rhum.testCase("Should shortcircuit preflight requests", async () => {
      const server = runServer();
      const response = await fetch("http://localhost:1447/cors", {
        method: "OPTIONS",
        headers: {
          "Origin": "localhost",
          "Access-Control-Request-Method": "GET",
          Accept: "text/plain",
        },
      });
      Rhum.asserts.assertEquals(
        response.status,
        204,
      );
      Rhum.asserts.assertEquals(
        response.headers.get("access-control-allow-origin"),
        "*",
      );
      Rhum.asserts.assertEquals(
        response.headers.get("access-control-allow-methods"),
        "GET,HEAD,PUT,PATCH,POST,DELETE",
      );
      Rhum.asserts.assertEquals(response.headers.get("vary"), "origin");
      Rhum.asserts.assertEquals(response.headers.get("content-length"), null);
      server.close();
    });
    Rhum.testCase("Should always set the vary header", async () => {
      const server = runServer();
      const response = await fetch("http://localhost:1447/cors", {
        method: "OPTIONS",
        headers: {
          "Origin": "localhost",
          "Access-Control-Request-Method": "GET",
          Accept: "text/plain",
        },
      });
      server.close();
      Rhum.asserts.assertEquals(response.headers.get("vary"), "origin");
    });
    Rhum.testCase(
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
        server.close();
        Rhum.asserts.assertEquals(response.headers.get("vary"), "origin");
        Rhum.asserts.assertEquals(
          response.headers.get("access-control-allow-origin"),
          null,
        );
        Rhum.asserts.assertEquals(
          response.headers.get("access-control-allow-methods"),
          null,
        );
      },
    );
    Rhum.testCase(
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
        server.close();
        Rhum.asserts.assertEquals(response.headers.get("vary"), "origin");
        Rhum.asserts.assertEquals(
          response.headers.get("access-control-allow-origin"),
          null,
        );
      },
    );
    Rhum.testCase(
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
        server.close();
        Rhum.asserts.assertEquals(
          response.headers.get("access-control-allow-headers"),
          "hello world",
        );
      },
    );
    Rhum.testCase(
      "Realworld example - Cors not enabled for request",
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
        server.close();
        Rhum.asserts.assertEquals(
          res.headers.get("access-control-allow-origin"),
          null,
        );
      },
    );
    Rhum.testCase(
      "Realworld example - Cors enabled for a single origin",
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
        server.close();
        Rhum.asserts.assertEquals(
          res.headers.get("access-control-allow-origin"),
          "localhost",
        );
      },
    );
    Rhum.testCase(
      "Realworld example - Cors enabled for every origin",
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
        server.close();
        Rhum.asserts.assertEquals(
          res.headers.get("access-control-allow-origin"),
          "*",
        );
      },
    );
  });
});

Rhum.run();
