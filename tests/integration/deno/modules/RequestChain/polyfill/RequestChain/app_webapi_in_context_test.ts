// Deno imports
import { assertEquals } from "@/tests/deps.ts";

// Test setup imports
import {
  testCases,
  testCasesNotFound,
} from "./test_data.ts";
import { hostname, port, protocol, send } from "./app_webapi_in_context.ts";

const url = `${protocol}://${hostname}:${port}`;

Deno.test("Polyfill - Using Request/Response in context object", async (t) => {
  await t.step("Home / paths = /", async (t) => {
    for await (const testCase of testCases) {
      const { method, expected } = testCase;

      await t.step(`${method} returns ${expected.status}`, async () => {
        const req = new Request(url + "/", {
          method,
        });

        const response = await send(req);
        const body = await response?.text();

        assertEquals(body, expected.body);
        assertEquals(response?.status, expected.status);
      });
    }
  });

  await t.step("Non-existent endpoints", async (t) => {
    for (const testCase of testCasesNotFound) {
      const { method, expected } = testCase;

      await t.step(`${method} returns ${expected.status}`, async () => {
        const req = new Request(url + "/test", {
          method,
        });

        const response = await send(req);
        const body = await response?.text();

        assertEquals(response?.status, expected.status);
        assertEquals(body, expected.body);
      });
    }
  });
});
