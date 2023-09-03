import { StatusCode } from "../../../../../../../../src/core/http/response/StatusCode.ts";
import { asserts } from "../../../../../../../deps.ts";
import { handleRequest, hostname, port, protocol } from "./app.ts";

const url = `${protocol}://${hostname}:${port}`;

Deno.test("Native - Using Request/Response", async (t) => {
  await t.step("Home / paths = /home -> /api/v1/home (blocked)", async (t) => {
    for (const testCase of testCasesWithMiddlewareMethods()) {
      const { method, expected, path } = testCase;

      await t.step(`${method} returns ${expected.status}`, async () => {
        const req = new Request(url + path, {
          method,
        });

        const response = await handleRequest(req);
        const body = await response?.text();

        asserts.assertEquals(response?.status, expected.status);
        asserts.assertEquals(body, expected.body);
      });
    }
  });

  await t.step(
    "Users / paths = /users -> /api/v2/users (blocked with ALL)",
    async (t) => {
      for (const testCase of testCasesWithMiddlewareAll()) {
        const { method, expected, path } = testCase;

        await t.step(`${method} returns ${expected.status}`, async () => {
          const req = new Request(url + path, {
            method,
          });

          const response = await handleRequest(req);
          const body = await response?.text();

          asserts.assertEquals(response?.status, expected.status);
          asserts.assertEquals(body, expected.body);
        });
      }
    },
  );

  await t.step("Non-existent endpoints", async (t) => {
    for (const testCase of testCasesNotFound()) {
      const { method, expected } = testCase;

      await t.step(`${method} returns ${expected.status}`, async () => {
        const req = new Request(url + "/home", {
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

function testCasesWithMiddlewareMethods() {
  return [
    {
      method: "GET",
      path: "/api/v1/home",
      expected: {
        status: 200,
        body: "Blocked",
      },
    },
    {
      method: "POST",
      path: "/api/v1/home",
      expected: {
        status: 200,
        body: "Blocked",
      },
    },
    {
      method: "PUT",
      path: "/api/v1/home",
      expected: {
        status: 501,
        body: "Blocked",
      },
    },
    {
      method: "DELETE",
      path: "/api/v1/home",
      expected: {
        status: 500,
        body: "Blocked",
      },
    },
    {
      method: "PATCH",
      path: "/api/v1/home",
      expected: {
        status: 405,
        body: "Blocked",
      },
    },
  ];
}

function testCasesWithMiddlewareAll() {
  return [
    {
      method: "GET",
      path: "/api/v2/users",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "POST",
      path: "/api/v2/users",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "PUT",
      path: "/api/v2/users",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "DELETE",
      path: "/api/v2/users",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "PATCH",
      path: "/api/v2/users",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
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
