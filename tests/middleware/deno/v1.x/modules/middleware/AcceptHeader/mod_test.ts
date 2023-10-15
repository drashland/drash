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

import { asserts } from "../../../../../../deps.ts";
import {
  assertionMessage,
  catchError,
  chain,
  query,
  testCaseName,
} from "../../../../utils.ts";
import { Method } from "../../../../../../../src/core/http/request/Method.ts";
import {
  AcceptHeader,
  AcceptHeaderMiddleware,
  defaultOptions,
  type Options,
} from "../../../../../../../src/modules/middleware/AcceptHeader/mod.ts";
import * as Chain from "../../../../../../../src/modules/chains/RequestChain/mod.native.ts";
import { HTTPError } from "../../../../../../../src/core/errors/HTTPError.ts";
import { Status } from "../../../../../../../src/core/http/response/Status.ts";
import { StatusCode } from "../../../../../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../src/core/http/response/StatusDescription.ts";
import { Handler } from "../../../../../../../src/standard/handlers/Handler.ts";

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
    body: unknown;
    headers?: Record<string, string>;
  };

type ExpectedCombined = Expected | { deno: Expected; drash: Expected };

const protocol = "http";
const hostname = "localhost";
const port = 1447;
const url = `${protocol}://${hostname}:${port}`;

// This variable gets set by each test case so that each test case uses the same
// chain
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
  Deno.test("AcceptHeader", async (t) => {
    await t.step("Deno Tests (using the chain in a Deno server)", async (t) => {
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

    await t.step("Drash Tests (using only the chain)", async (t) => {
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

              const response = await chain
                .handle<Response>(req)
                .catch(catchError);

              await assert(
                "Drash",
                testCaseIndex,
                req,
                requestIndex,
                response,
                ("drash" in expected_response)
                  ? expected_response.drash
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
  asserts.assertEquals(
    await actualResponse.clone().text(),
    expectedResponse.body,
    assertionMessage(
      `AcceptHeader test failed in ${system}:`,
      `\n  Response body does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.status,
    expectedResponse.status,
    assertionMessage(
      `AcceptHeader test failed in ${system}:`,
      `\n  Response status does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.statusText,
    expectedResponse.statusText,
    assertionMessage(
      `AcceptHeader test failed in ${system}:`,
      `\n  Response statusText does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );
}

function getTestCases(): TestCase[] {
  return [
    {
      chain: chain({
        middleware: [getAcceptHeaderMiddleware({ logs: false })],
        resources: [
          class AcceptHeaderResource extends Chain.Resource {
            paths = ["/accept-header"];

            GET(_request: Chain.Request) {
              return new Response("Hello from GET.");
            }

            POST(_request: Chain.Request) {
              return new Response(
                JSON.stringify({ message: "Hello from POST." }),
                {
                  status: StatusCode.OK,
                  statusText: StatusDescription.OK,
                  headers: {
                    "content-type": "application/json",
                  },
                },
              );
            }

            DELETE(_request: Chain.Request) {
              return new Response("Deleted!");
            }

            PATCH(_request: Chain.Request) {
              throw new HTTPError(Status.MethodNotAllowed);
            }
          },
        ],
      }),
      requests: [
        {
          request: {
            method: Method.GET,
            path: "/accept-header",
            headers: {
              accept: "application/json",
            },
          },
          expected_response: {
            status: 422,
            statusText: "Unprocessable Entity",
            headers: {},
            body:
              "The server did not generate a response matching the request's Accept header",
          },
        },
        {
          request: {
            method: Method.POST,
            path: "/accept-header",
            headers: {
              accept: "application/json",
            },
          },
          expected_response: {
            status: 200,
            statusText: "OK",
            body: `{"message":"Hello from POST."}`,
          },
        },
        {
          request: {
            method: Method.PUT,
            path: "/accept-header",
            headers: {
              accept: "*/*",
            },
          },
          expected_response: {
            status: 501,
            statusText: "Not Implemented",
            body: "Not Implemented",
          },
        },
        {
          request: {
            method: Method.DELETE,
            path: "/accept-header",
            headers: {
              accept: "*/*",
            },
          },
          expected_response: {
            deno: {
              status: 200,
              statusText: "OK", // Deno magically sets this
              body: "Deleted!",
            },
            drash: {
              status: 200,
              statusText: "", // No statusText was set in the resource, so we expect blank. We do not magically set it.
              body: "Deleted!",
            },
          },
        },
        {
          request: {
            method: Method.PATCH,
            path: "/accept-header",
            headers: {
              accept: "*/*",
            },
          },
          expected_response: {
            status: 405,
            statusText: "Method Not Allowed",
            body: "Method Not Allowed",
          },
        },
      ],
    },
  ];
}

/**
 * Helper function to use a decorated AcceptHeader middleware (with logs for
 * debugging purposes) or the original AcceptHeader middleware.
 */
function getAcceptHeaderMiddleware(
  options: Options & { logs?: boolean } = defaultOptions,
) {
  if (!options.logs) {
    return AcceptHeader(options);
  }

  return new class AcceptHeaderLogged extends AcceptHeaderMiddleware {
    constructor() {
      super(options);
    }

    ALL(request: Request): Promise<Response> {
      return Promise
        .resolve()
        .then(() => {
          console.log(`Calling handleIfAcceptHeaderMissing()`);
          return this.handleIfAcceptHeaderMissing(request);
        })
        .then(() => super.next<Response>(request))
        .then((response) => ({ request, response }))
        .then((context) => {
          console.log(`Calling handleHeaders()`);
          return this.handleHeaders(context);
        })
        .then((context) => {
          console.log(`Calling sendResponse()`);
          const r = this.sendResponse(context);
          console.log(`Response received:`, r);
          return r;
        });
    }
  }();
}
