/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

import { StatusCode } from "../../../../../../../../src/core/http/response/StatusCode.ts";
import { asserts } from "../../../../../../../deps.ts";
import { handleRequest, hostname, port, protocol } from "./app.ts";

const url = `${protocol}://${hostname}:${port}`;

Deno.test("Native - Using Request/Response", async (t) => {
  for (const testCase of testCasesWithMiddlewareMethods()) {
    const { method, expected, path } = testCase;

    await t.step(`${method} ${path} -> Status: ${expected.status}; Body: ${expected.body}`, async (t) => {
      const req = new Request(url + path, {
        method,
      });

      const response = await handleRequest(req);
      const body = await response?.text();

      asserts.assertEquals(body, expected.body);
      asserts.assertEquals(response?.status, expected.status);
    });
  }


  for (const testCase of testCasesWithMiddlewareAll()) {
    const { method, expected } = testCase;

    const path = "/api/v2/users-all";

    await t.step(`${method} ${path} -> Status: ${expected.status}; Body: ${expected.body}`, async (t) => {
      const req = new Request(url + path, {
        method,
      });

      const response = await handleRequest(req);
      const body = await response?.text();

      asserts.assertEquals(body, expected.body);
      asserts.assertEquals(response?.status, expected.status);
    });
  }

  for (const testCase of testCasesWithMiddlewareAllGet()) {
    const { method, expected } = testCase;

    const path = "/api/v2/users-all-get";

    await t.step(`${method} ${path} -> Status: ${expected.status}; Body: ${expected.body}`, async (t) => {
      const req = new Request(url + path, {
        method,
      });

      const response = await handleRequest(req);
      const body = await response?.text();

      asserts.assertEquals(body, expected.body);
      asserts.assertEquals(response?.status, expected.status);
    });
  }

  for (const testCase of testCasesWithMiddlewareAllGetGetAgain()) {
    const { method, expected } = testCase;

    const path = "/api/v2/users-all-get-get-again";

    await t.step(`${method} ${path} -> Status: ${expected.status}; Body: ${expected.body}`, async (t) => {
      const req = new Request(url + path, {
        method,
      });

      const response = await handleRequest(req);
      const body = await response?.text();

      asserts.assertEquals(body, expected.body);
      asserts.assertEquals(response?.status, expected.status);
    });
  }

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
      expected: {
        status: StatusCode.OK,
        body: "MiddlewareALL touched;Hello from GET.",
      },
    },
    {
      method: "POST",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "PUT",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "DELETE",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "PATCH",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
  ];
}

function testCasesWithMiddlewareAllGetGetAgain() {
  return [
    {
      method: "GET",
      expected: {
        status: StatusCode.OK,
        body: "MiddlewareALL touched;MiddlewareGET touched;MiddlewareGETAgain touched;MiddlewareGETAgain2 touched;MiddlewareGETAgain3 touched, but blocking access to the resource",
      },
    },
    {
      method: "POST",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "PUT",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "DELETE",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "PATCH",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
  ];
}

function testCasesWithMiddlewareAllGet() {
  return [
    {
      method: "GET",
      expected: {
        status: StatusCode.OK,
        body: "MiddlewareALL touched;MiddlewareGET touched;Hello from GET.",
      },
    },
    {
      method: "POST",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "PUT",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "DELETE",
      expected: {
        status: StatusCode.Created,
        body: "Alllllll that",
      },
    },
    {
      method: "PATCH",
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
