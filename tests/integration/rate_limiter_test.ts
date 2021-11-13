import { Rhum } from "../deps.ts";
import { RateLimiterService } from "../../src/services/rate_limiter/rate_limiter.ts";
import * as Drash from "../../mod.ts";

class Resource extends Drash.Resource {
  paths = ["/"];
  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.text("Hello world");
  }
}

Rhum.testPlan("rate_limiter_test", () => {
  Rhum.testSuite("Not hit limit", () => {
    Rhum.testCase(
      "Header should be set correctly when you request and haven't hit the limit",
      async () => {
        const rateLimiter = new RateLimiterService({
          timeframe: 15 * 60 * 1000,
          max_requests: 3,
        });
        const server = new Drash.Server({
          resources: [Resource],
          services: [rateLimiter],
          protocol: "http",
          port: 1667,
          hostname: "localhost",
        });
        server.run();
        const res1 = await fetch(server.address);
        Rhum.asserts.assertEquals(res1.status, 200);
        Rhum.asserts.assertEquals(await res1.text(), "Hello world");
        Rhum.asserts.assert(res1.headers.get("date"));
        Rhum.asserts.assertEquals(res1.headers.get("x-ratelimit-limit"), "3");
        Rhum.asserts.assertEquals(
          res1.headers.get("x-ratelimit-remaining"),
          "2",
        );
        Rhum.asserts.assert(res1.headers.get("x-ratelimit-reset"));
        const res2 = await fetch(server.address);
        await server.close();
        Rhum.asserts.assertEquals(res2.status, 200);
        Rhum.asserts.assertEquals(await res2.text(), "Hello world");
        Rhum.asserts.assert(res2.headers.get("date"));
        Rhum.asserts.assertEquals(res2.headers.get("x-ratelimit-limit"), "3");
        Rhum.asserts.assertEquals(
          res2.headers.get("x-ratelimit-remaining"),
          "1",
        );
        Rhum.asserts.assert(res2.headers.get("x-ratelimit-reset"));
        rateLimiter.cleanup();
      },
    );
  });
  Rhum.testSuite("Has hit limit", () => {
    Rhum.testCase(
      "Header should be set correctly when you request and have hit the limit",
      async () => {
        const rateLimiter = new RateLimiterService({
          timeframe: 15 * 60 * 1000,
          max_requests: 3,
        });
        const server = new Drash.Server({
          resources: [Resource],
          services: [rateLimiter],
          protocol: "http",
          port: 1667,
          hostname: "localhost",
        });
        server.run();
        const res1 = await fetch(server.address);
        await res1.arrayBuffer();
        const res2 = await fetch(server.address);
        await res2.arrayBuffer();
        const res3 = await fetch(server.address);
        Rhum.asserts.assertEquals(res3.status, 200);
        Rhum.asserts.assertEquals(await res3.text(), "Hello world");
        Rhum.asserts.assert(res3.headers.get("date"));
        Rhum.asserts.assertEquals(res3.headers.get("x-ratelimit-limit"), "3");
        Rhum.asserts.assertEquals(
          res3.headers.get("x-ratelimit-remaining"),
          "0",
        );
        Rhum.asserts.assert(res3.headers.get("x-ratelimit-reset"));
        Rhum.asserts.assertEquals(res3.headers.get("x-retry-after"), null);
        const res4 = await fetch(server.address);
        await server.close();
        Rhum.asserts.assertEquals(res4.status, 429);
        const text = await res4.text();
        Rhum.asserts.assert(
          text.startsWith("Error: Too many requests, please try again later."),
        );
        Rhum.asserts.assert(res4.headers.get("date"));
        Rhum.asserts.assertEquals(res4.headers.get("x-ratelimit-limit"), "3");
        Rhum.asserts.assertEquals(
          res4.headers.get("x-ratelimit-remaining"),
          "0",
        );
        Rhum.asserts.assert(res4.headers.get("x-ratelimit-reset"));
        Rhum.asserts.assertEquals(res4.headers.get("x-retry-after"), "900s");
        rateLimiter.cleanup();
      },
    );
  });
});

Rhum.run();
