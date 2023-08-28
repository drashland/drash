import { asserts } from "../../../../../../deps.ts";
import { handleRequest, hostname, port, protocol } from "./app_polyfill.ts";

const url = `${protocol}://${hostname}:${port}`;

Deno.test("Native - Using Request/Response", async (t) => {
  await t.step("Home / paths = /", async (t) => {
    for (const testCase of testCases()) {
      const { method, expected } = testCase;

      await t.step(`${method} returns ${expected.status}`, async () => {
        const req = new Request(url + "/", {
          method,
        });

        const response = await handleRequest(req);
        const body = await response?.text();

        asserts.assertEquals(response?.status, expected.status);
        asserts.assertEquals(body, expected.body);
      });
    }
  });

  await t.step("Non-existent endpoints", async (t) => {
    for (const testCase of testCasesNotFound()) {
      const { method, expected } = testCase;

      await t.step(`${method} returns ${expected.status}`, async () => {
        const req = new Request(url + "/test", {
          method,
        });

        const response = await handleRequest(req);
        const body = await response?.text();

        asserts.assertEquals(response?.status, expected.status);
        asserts.assertEquals(body, expected.body);
      });
    }
  });
});

function testCases() {
  return [
    {
      method: "GET",
      expected: {
        status: 200,
        body: "Hello from GET.",
      },
    },
    {
      method: "POST",
      expected: {
        status: 200,
        body: "Hello from POST.",
      },
    },
    {
      method: "PUT",
      expected: {
        status: 501,
        body: "Not Implemented",
      },
    },
    {
      method: "DELETE",
      expected: {
        status: 500,
        body: "Hey, I'm the DELETE endpoint. Errrr.",
      },
    },
    {
      method: "PATCH",
      expected: {
        status: 405,
        body: "Method Not Allowed",
      },
    },
  ];
}

function testCasesNotFound() {
  return [
    {
      method: "GET",
      expected: {
        status: 404,
        body: "Not Found",
      },
    },
    {
      method: "POST",
      expected: {
        status: 404,
        body: "Not Found",
      },
    },
    {
      method: "PUT",
      expected: {
        status: 404,
        body: "Not Found",
      },
    },
    {
      method: "DELETE",
      expected: {
        status: 404,
        body: "Not Found",
      },
    },
    {
      method: "PATCH",
      expected: {
        status: 404,
        body: "Not Found",
      },
    },
  ];
}
