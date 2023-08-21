// Deno imports
import { assertEquals } from "@/tests/deps.ts";

// Test setup imports
import {
  testCases,
  testCasesNotFound,
} from "./test_data.ts";
import { hostname, port, protocol, send } from "./app_webapi.ts";

const url = `${protocol}://${hostname}:${port}`;

Deno.test("Native - Using Request/Response", async (t) => {
  await t.step("Home / paths = /", async (t) => {
    for (const testCase of testCases) {
      const { method, expected } = testCase;

      await t.step(`${method} returns ${expected.status}`, async () => {
        const req = new Request(url + "/", {
          method,
        });

        const response = await send(req);
        const body = await response?.text();

        assertEquals(response?.status, expected.status);
        assertEquals(body, expected.body);
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
