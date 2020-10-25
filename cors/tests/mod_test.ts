import { Rhum } from "../../test_deps.ts";
import { Drash } from "../../deps.ts";
import { CorsMiddleware } from "../mod.ts";

const cors = CorsMiddleware();

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

async function runServer(): Promise<Drash.Http.Server> {
  const server = new Drash.Http.Server({
    response_output: "application/json",
    middleware: {
      after_request: [
        // @ts-ignore
        cors,
      ],
    },
    resources: [
      FailedOptionCorsMiddlewareResource,
    ],
  });
  await server.run({
    hostname: "localhost",
    port: 1447,
  });
  return server;
}

Rhum.testPlan("cors/tests/mod_test.ts", () => {
  Rhum.testSuite("Cors", () => {
    Rhum.testCase("Should shortcircuit preflight requests", async () => {
      let response;
      const server = await runServer();
      response = await fetch("http://localhost:1447/cors", {
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
  });
});

Rhum.run();
