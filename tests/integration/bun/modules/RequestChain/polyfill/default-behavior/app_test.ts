import { describe, expect, it } from "bun:test";
import { hostname, port, protocol, send } from "./app";

const url = `${protocol}://${hostname}:${port}`;

describe("Polyfill - Using Request/Response", () => {
  describe("Home / paths = /", () => {
    for (const testCase of testCases()) {
      const { method, expected } = testCase;
        it(`${method} returns ${expected.status}`, async () => {
          const req = new Request(url + "/", {
            method,
          });

          const response = await send(req);
          const body = await response?.text();

          expect(response?.status).toBe(expected.status);
          expect(body).toBe(expected.body);
        });
      }
  });

  describe("Non-existent endpoints / path = test", () => {
    for (const testCase of testCasesNotFound()) {
      const { method, expected } = testCase;
      it(`${method} returns ${expected.status}`, async () => {
        const req = new Request(url + "/test", {
          method,
        });

        const response = await send(req);
        const body = await response?.text();

        expect(response?.status).toBe(expected.status);
        expect(body).toBe(expected.body);
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
      }
    },
    {
      method: "POST",
      expected: {
        status: 200,
        body: "Hello from POST.",
      }
    },
    {
      method: "PUT",
      expected: {
        status: 501,
        body: "Not Implemented",
      }
    },
    {
      method: "DELETE",
      expected: {
        status: 500,
        body: "Hey, I'm the DELETE endpoint. Errrr.",
      }
    },
    {
      method: "PATCH",
      expected: {
        status: 405,
        body: "Method Not Allowed",
      }
    }
  ];
}

function testCasesNotFound() {
  return [
    {
      method: "GET",
      expected: {
        status: 404,
        body: "Not Found"
      }
    },
    {
      method: "POST",
      expected: {
        status: 404,
        body: "Not Found"
      }
    },
    {
      method: "PUT",
      expected: {
        status: 404,
        body: "Not Found"
      }
    },
    {
      method: "DELETE",
      expected: {
        status: 404,
        body: "Not Found"
      }
    },
    {
      method: "PATCH",
      expected: {
        status: 404,
        body: "Not Found"
      }
    },
  ];
}
