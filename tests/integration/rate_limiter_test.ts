import { assert, assertEquals } from "../deps.ts";
import { RateLimiterService } from "../../src/services/rate_limiter/rate_limiter.ts";
import * as Drash from "../../mod.ts";

class Resource extends Drash.Resource {
  paths = ["/"];
  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.text("Hello world");
  }
}

Deno.test("rate_limiter_test", async (t) => {
  await t.step("Not hit limit", async (t) => {
    await t.step(
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
        assertEquals(res1.status, 200);
        assertEquals(await res1.text(), "Hello world");
        assert(res1.headers.get("date"));
        assertEquals(res1.headers.get("x-ratelimit-limit"), "3");
        assertEquals(
          res1.headers.get("x-ratelimit-remaining"),
          "2",
        );
        assert(res1.headers.get("x-ratelimit-reset"));
        const res2 = await fetch(server.address);
        await server.close();
        assertEquals(res2.status, 200);
        assertEquals(await res2.text(), "Hello world");
        assert(res2.headers.get("date"));
        assertEquals(res2.headers.get("x-ratelimit-limit"), "3");
        assertEquals(
          res2.headers.get("x-ratelimit-remaining"),
          "1",
        );
        assert(res2.headers.get("x-ratelimit-reset"));
        rateLimiter.cleanup();
      },
    );
  });
  await t.step("Has hit limit", async (t) => {
    await t.step(
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
        assertEquals(res3.status, 200);
        assertEquals(await res3.text(), "Hello world");
        assert(res3.headers.get("date"));
        assertEquals(res3.headers.get("x-ratelimit-limit"), "3");
        assertEquals(
          res3.headers.get("x-ratelimit-remaining"),
          "0",
        );
        assert(res3.headers.get("x-ratelimit-reset"));
        assertEquals(res3.headers.get("x-retry-after"), null);
        const res4 = await fetch(server.address);
        await server.close();
        assertEquals(res4.status, 429);
        const text = await res4.text();
        const retryAfter = res4.headers.get("x-retry-after");
        assert(
          text.startsWith(
            "Error: Too Many Requests. Please try again after " + retryAfter,
          ),
        );
        assert(res4.headers.get("date"));
        assertEquals(res4.headers.get("x-ratelimit-limit"), "3");
        assertEquals(
          res4.headers.get("x-ratelimit-remaining"),
          "0",
        );
        assert(res4.headers.get("x-ratelimit-reset"));
        assertEquals(res4.headers.get("x-retry-after"), "900s");
        rateLimiter.cleanup();
      },
    );
  });
});
