import { Rhum } from "../../test_deps.ts";
import { Drash } from "../../deps.ts";
import { Cors } from "../mod.ts";

class FailedOptionCorsMiddlewareResource extends Drash.Http.Resource {
  static paths = ["/cors"];
  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
  public OPTIONS() {
    return this.response;
  }
}

async function runServer(allowAll: boolean = true): Promise<Drash.Http.Server> {
  const cors = allowAll ? Cors() : Cors({ origin: "localhost" });
  const server = new Drash.Http.Server({
    response_output: "application/json",
    middleware: {
      after_request: [
        cors,
      ],
    },
    resources: [
      FailedOptionCorsMiddlewareResource,
    ],
  });
  await server.run({
    hostname: "127.0.0.1",
    port: 1447,
  });
  return server;
}

Rhum.testPlan("cors/tests/mod_test.ts", () => {
  // Also covers unit tests
  Rhum.testSuite("Integration", () => {
    Rhum.testCase("Should shortcircuit preflight requests", async () => {
      const server = await runServer();
      const response = await fetch("http://localhost:1447/cors", {
        method: "OPTIONS",
        headers: {
          "Origin": "localhost",
          "Access-Control-Request-Method": "GET",
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
      Rhum.asserts.assertEquals(response.headers.get("content-length"), "0");
      server.close();
    });
    Rhum.testCase("Should always set the vary header", async () => {
      const server = await runServer();
      const response = await fetch("http://localhost:1447/cors", {
        method: "OPTIONS",
        headers: {
          "Origin": "localhost",
          "Access-Control-Request-Method": "GET",
        },
      });
      server.close();
      Rhum.asserts.assertEquals(response.headers.get("vary"), "origin");
    });
    Rhum.testCase(
      "Only sets the vary header if Origin header is not set",
      async () => {
        const server = await runServer();
        const response = await fetch("http://localhost:1447/cors", {
          method: "OPTIONS",
          headers: {
            "Access-Control-Request-Method": "GET",
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
        const server = await runServer(false);
        const response = await fetch("http://localhost:1447/cors", {
          method: "OPTIONS",
          headers: {
            "Origin": "the big bang",
            "Access-Control-Request-Method": "GET",
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
        const server = await runServer(false);
        const response = await fetch("http://localhost:1447/cors", {
          method: "OPTIONS",
          headers: {
            "Origin": "localhost",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "hello world",
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
    Rhum.testCase("Realworld example", async () => {
      // Failed request - access control header is not present
      const serverOne = await runServer(false)
      const resOne = await fetch("http://localhost:1447", {
        method: "GET",
        headers: {
          Origin: "https://google.com"
        }
      })
      await resOne.text()
      serverOne.close()
      Rhum.asserts.assertEquals(resOne.headers.get("access-control-allow-origin"), null)
      // Successful request - access control header is present and the value of the origin
      const serverTwo = await runServer(false)
      const resTwo = await fetch("http://localhost:1447", {
        method: "GET",
        headers: {
          Origin: "localhost" // As server two is setting cors origin as localhost
        }
      })
      await resTwo.text()
      serverTwo.close()
      Rhum.asserts.assertEquals(resTwo.headers.get("access-control-allow-origin"), "localhost")
    })
  });
});

Rhum.run();
