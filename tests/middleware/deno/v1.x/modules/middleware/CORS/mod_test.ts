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

import { Method } from "../../../../../../../src/core/http/request/Method.ts";
import { Status } from "../../../../../../../src/core/http/response/Status.ts";
import {
  CORS,
  CORSMiddleware,
  defaultOptions,
  Options,
} from "../../../../../../../src/modules/middleware/CORS/mod.ts";
import { Handler } from "../../../../../../../src/standard/handlers/Handler.ts";
import { asserts } from "../../../../../../deps.ts";
import { catchError, query } from "../../../../utils.ts";
import { assertionMessage, chain, testCaseName } from "../../../../utils.ts";

type TestCase = {
  chain: Handler;
  requests: {
    request: RequestInfo;
    expected_response: ExpectedCombined;
  }[];
};

type RequestInfo =
  & RequestInit
  & {
    path: string;
    query?: Record<string, string>;
  };

type Expected =
  & ResponseInit
  & {
    body?: unknown;
    headers?: Record<string, string>;
  };

type ExpectedCombined = Expected | { deno: Expected; drash: Expected };

const protocol = "http";
const hostname = "localhost";
const port = 1447;
const url = `${protocol}://${hostname}:${port}`;

// This variable gets set by each test case so that each test case uses the same
// chain
//
const globals: {
  current_chain: Handler | null;
} = {
  current_chain: null,
};

const serverController = new AbortController();

Deno.serve(
  {
    port,
    hostname,
    onListen: () => runTests(),
    signal: serverController.signal,
  },
  (request: Request): Promise<Response> => {
    if (!globals.current_chain) {
      throw new Error(`Var \`globals.current_chain\` was not set by the test`);
    }

    return globals.current_chain
      .handle<Response>(request)
      .catch(catchError);
  },
);

function runTests() {
  Deno.test("CORS", async (t) => {
    await t.step("Deno Tests (using Deno server and chain)", async (t) => {
      const testCases = getTestCases();

      for (const [testCaseIndex, testCase] of testCases.entries()) {
        const { chain, requests } = testCase;

        // Set the current chain to be the chain in this test case so the server (outside this
        // test function) can use it.
        globals.current_chain = chain;

        for (
          const [requestIndex, { request, expected_response }] of requests
            .entries()
        ) {
          await t.step(
            `${testCaseName(testCaseIndex)} ${request.method} ${request.path}`,
            async () => {
              const requestOptions: Record<string, unknown> = {
                method: request.method,
              };

              requestOptions.headers = request.headers ?? {};
              const fullUrl = url + request.path + query(request.query);

              const req = new Request(fullUrl, requestOptions);

              const response = await fetch(req);

              await assert(
                "Deno",
                testCaseIndex,
                req,
                requestIndex,
                response,
                ("deno" in expected_response)
                  ? expected_response.deno
                  : expected_response,
              );
            },
          );
        }
      }
    });

    await t.step("Drash Tests (using chain only)", async (t) => {
      const testCases = getTestCases();

      for (const [testCaseIndex, testCase] of testCases.entries()) {
        const { chain, requests } = testCase;

        for (
          const [requestIndex, { request, expected_response }] of requests
            .entries()
        ) {
          await t.step(
            `${testCaseName(testCaseIndex)} ${request.method} ${request.path}`,
            async () => {
              const requestOptions: Record<string, unknown> = {
                method: request.method,
              };

              requestOptions.headers = request.headers ?? {};
              const fullUrl = url + request.path + query(request.query);

              const req = new Request(fullUrl, requestOptions);

              const response = await chain.handle<Response>(req);

              await assert(
                "Drash",
                testCaseIndex,
                req,
                requestIndex,
                response,
                ("drash" in expected_response)
                  ? expected_response.deno
                  : expected_response,
              );
            },
          );
        }
      }
    });
  });
}

async function assert(
  system: "Drash" | "Deno",
  testCaseIndex: number,
  request: Request,
  requestIndex: number,
  actualResponse: Response,
  expectedResponse: Expected,
) {
  if (expectedResponse.body === null) {
    const body = await actualResponse.clone().body;
    asserts.assertEquals(
      body,
      expectedResponse.body,
      assertionMessage(
        `CORS test failed in ${system}:`,
        `\n  Response body ${body} does not match expected null`,
        `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
        `\n  ${request.method} ${request.url.replace(url, "")}`,
      ),
    );
  } else {
    const body = await actualResponse.clone().text();
    asserts.assertEquals(
      body,
      expectedResponse.body,
      assertionMessage(
        `CORS test failed in ${system}:`,
        `\n  Response body ${body} does not match expected ${expectedResponse.body}`,
        `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
        `\n  ${request.method} ${request.url.replace(url, "")}`,
      ),
    );
  }

  asserts.assertEquals(
    actualResponse.status,
    expectedResponse.status,
    assertionMessage(
      `CORS test failed in ${system}:`,
      `\n  Response status does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.statusText,
    expectedResponse.statusText,
    assertionMessage(
      `CORS test failed in ${system}`,
      `\n  Response statusText does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );
}

function getTestCases(): TestCase[] {
  return [
    // 0
    {
      chain: chain({
        middleware: [getCorsMiddleware()],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 1
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {},
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { "access-control-request-headers": "x-yezzir" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "*",
              "content-length": "0",
              "vary": "Access-Control-Request-Headers",
            },
          },
        },
      ],
    },

    // 2
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {
            access_control_allow_origin: [
              "http://test",
              "https://woopwoop2",
              /.*woopwoop3\.local.*/,
              new RegExp("http(s)?://slowbro$"),
            ],
          },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://woopwoop" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "false",
              "content-length": "0",
              "vary": "Origin",
            },
          },
        },
      ],
    },

    // 3
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {
            access_control_allow_origin: [
              "http://test",
              "https://woopwoop2",
              /.*woopwoop3\.local.*/,
              new RegExp("http(s)?://slowbro$"),
            ],
          },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://test" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "http://test",
              "content-length": "0",
              "vary": "Origin",
            },
          },
        },
      ],
    },

    // 4
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {
            access_control_allow_origin: [
              "http://test",
              "https://woopwoop2",
              /.*woopwoop3\.local.*/,
              new RegExp("http(s)?://slowbro$"),
            ],
          },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "https://woopwoop2" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "https://woopwoop2",
              "content-length": "0",
              "vary": "Origin",
            },
          },
        },
      ],
    },

    // 5
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {
            access_control_allow_origin: [
              "http://test",
              "https://woopwoop2",
              /.*woopwoop3\.local.*/,
              new RegExp("http(s)?://slowbro$"),
            ],
          },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://woopwoop3.local" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "http://woopwoop3.local",
              "content-length": "0",
              "vary": "Origin",
            },
          },
        },
      ],
    },

    // 6
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {
            access_control_allow_origin: [
              "http://test",
              "https://woopwoop2",
              /.*woopwoop3\.local.*/,
              new RegExp("http(s)?://slowbro$"),
            ],
          },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://slowbro" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "http://slowbro",
              "content-length": "0",
              "vary": "Origin",
            },
          },
        },
      ],
    },

    // 7
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {
            access_control_allow_origin: [
              "http://test",
              "https://woopwoop2",
              /.*woopwoop3\.local.*/,
              new RegExp("http(s)?://slowbro$"),
            ],
          },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://slowbros" }, // The last `s` character should cause a `false` origin,
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "false",
              "content-length": "0",
              "vary": "Origin",
            },
          },
        },
      ],
    },

    // 8
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {
            access_control_allow_origin: [
              "http://test",
              "https://woopwoop2",
              /.*woopwoop3\.local.*/,
              new RegExp("http(s)?://slowbro$"),
            ],
          },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "https://slowbro" }, // https should work too
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "https://slowbro",
              "content-length": "0",
              "vary": "Origin",
            },
          },
        },
      ],
    },

    // 9
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          {
            access_control_allow_origin: [
              "http://test",
              "https://woopwoop2",
              /.*woopwoop3\.local.*/,
              new RegExp("http(s)?://slowbro$"),
            ],
          },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "https://slowbros" }, // The last `s` character should cause a `false` origin again
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "false",
              "content-length": "0",
              "vary": "Origin",
            },
          },
        },
      ],
    },

    // 10
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { options_success_status: Status.OK }, // This results in a "" response body in Deno
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
          },
          expected_response: {
            deno: {
              status: 200,
              statusText: "OK",
              body: "", // Deno automagically sets the response
              headers: {
                "access-control-allow-methods":
                  "GET,HEAD,PUT,PATCH,POST,DELETE",
                "access-control-allow-origin": "*",
                "content-length": "0",
              },
            },
            drash: {
              status: 200,
              statusText: "OK",
              body: null,
              headers: {
                "access-control-allow-methods":
                  "GET,HEAD,PUT,PATCH,POST,DELETE",
                "access-control-allow-origin": "*",
                "content-length": "0",
              },
            },
          },
        },
      ],
    },

    // 11
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { options_success_status: Status.OK }, // This results in a "" response body in Deno
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "https://woopwoop2" },
          },
          expected_response: {
            deno: {
              status: 200,
              statusText: "OK",
              body: "",
              headers: {
                "access-control-allow-methods":
                  "GET,HEAD,PUT,PATCH,POST,DELETE",
                "access-control-allow-origin": "*",
                "content-length": "0",
              },
            },
            drash: {
              status: 200,
              statusText: "OK",
              body: "",
              headers: {
                "access-control-allow-methods":
                  "GET,HEAD,PUT,PATCH,POST,DELETE",
                "access-control-allow-origin": "*",
                "content-length": "0",
              },
            },
          },
        },
      ],
    },

    // 12
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { options_success_status: Status.OK }, // This results in a "" response body in Deno
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://woopwoop3.local" },
          },
          expected_response: {
            deno: {
              status: 200,
              statusText: "OK",
              body: "",
              headers: {
                "access-control-allow-methods":
                  "GET,HEAD,PUT,PATCH,POST,DELETE",
                "access-control-allow-origin": "*",
                "content-length": "0",
              },
            },
            drash: {
              status: 200,
              statusText: "OK",
              body: null,
              headers: {
                "access-control-allow-methods":
                  "GET,HEAD,PUT,PATCH,POST,DELETE",
                "access-control-allow-origin": "*",
                "content-length": "0",
              },
            },
          },
        },
      ],
    },

    // 13
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { options_success_status: Status.OK }, // This results in a "" response body in Deno
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://slowbro" },
          },
          expected_response: {
            deno: {
              status: 200,
              statusText: "OK",
              body: "",
              headers: {
                "access-control-allow-methods":
                  "GET,HEAD,PUT,PATCH,POST,DELETE",
                "access-control-allow-origin": "*",
                "content-length": "0",
              },
            },
            drash: {
              status: 200,
              statusText: "OK",
              body: null,
              headers: {
                "access-control-allow-methods":
                  "GET,HEAD,PUT,PATCH,POST,DELETE",
                "access-control-allow-origin": "*",
                "content-length": "0",
              },
            },
          },
        },
      ],
    },

    // 14
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_allow_methods: ["GET"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 15
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_allow_methods: ["GET"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "https://woopwoop2" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 16
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_allow_methods: ["GET"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://woopwoop3.local" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 17
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_allow_methods: ["GET"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://slowbro" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 18
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_max_age: 1000 },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "*",
              "access-control-max-age": "1000",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 19
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_max_age: 1000 },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "https://woopwoop2" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "*",
              "access-control-max-age": "1000",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 20
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_max_age: 1000 },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://woopwoop3.local" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "*",
              "access-control-max-age": "1000",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 21
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_max_age: 1000 },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://slowbro" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-origin": "*",
              "access-control-max-age": "1000",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 22
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_allow_headers: ["x-hello", "x-nah-brah"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-headers": "x-hello,x-nah-brah",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 23
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_allow_headers: ["x-hello", "x-nah-brah"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: {
              origin: "https://woopwoop2",
              "access-control-request-headers": "x-test",
            },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-headers": "x-hello,x-nah-brah,x-test",
              "access-control-allow-origin": "*",
              "content-length": "0",
              "vary": "Access-Control-Request-Headers",
            },
          },
        },
      ],
    },

    // 24
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_allow_headers: ["x-hello", "x-nah-brah"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://woopwoop3.local" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-headers": "x-hello,x-nah-brah",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 25
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_allow_headers: ["x-hello", "x-nah-brah"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://slowbro" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-allow-headers": "x-hello,x-nah-brah",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 26
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_expose_headers: ["x-pose-headers", "x-anotha-one"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-expose-headers": "x-pose-headers,x-anotha-one",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 27
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_expose_headers: ["x-pose-headers", "x-anotha-one"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: {
              origin: "https://woopwoop2",
              "access-control-request-headers": "x-test",
            },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-expose-headers": "x-pose-headers,x-anotha-one",
              "access-control-allow-origin": "*",
              "content-length": "0",
              "vary": "Access-Control-Request-Headers",
            },
          },
        },
      ],
    },

    // 28
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_expose_headers: ["x-pose-headers", "x-anotha-one"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://woopwoop3.local" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-expose-headers": "x-pose-headers,x-anotha-one",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },

    // 29
    {
      chain: chain({
        middleware: [getCorsMiddleware(
          { access_control_expose_headers: ["x-pose-headers", "x-anotha-one"] },
        )],
      }),
      requests: [
        {
          request: {
            method: Method.OPTIONS,
            path: "/",
            headers: { origin: "http://slowbro" },
          },
          expected_response: {
            status: 204,
            statusText: "No Content",
            body: null,
            headers: {
              "access-control-allow-methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
              "access-control-expose-headers": "x-pose-headers,x-anotha-one",
              "access-control-allow-origin": "*",
              "content-length": "0",
            },
          },
        },
      ],
    },
  ];
}

/**
 * Helper function to use a decorated ETag middleware (with logs for debugging
 * purposes) or the original ETag middleware.
 */
function getCorsMiddleware(
  options: Options & { logs?: boolean } = defaultOptions,
) {
  if (!options.logs) {
    return CORS(options);
  }

  return class CORSLogged extends CORSMiddleware {
    constructor() {
      super(options);
    }

    ALL(request: Request): Promise<Response> {
      return super.ALL(request);
    }

    OPTIONS(request: Request) {
      return super.OPTIONS(request);
    }
  };
}
