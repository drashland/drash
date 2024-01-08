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
import { StatusCode } from "../../../../../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../src/core/http/response/StatusDescription.ts";
import { Method } from "../../../../../../../src/core/http/request/Method.ts";
import * as Chain from "../../../../../../../src/modules/chains/RequestChain/mod.native.ts";
import {
  defaultOptions,
  ETag,
  ETagMiddleware,
  type Options,
} from "../../../../../../../src/modules/middleware/ETag/mod.ts";
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
// chain. If the chain is recreated during each test case, then the ETag
// middleware will lose its cache of generated etags. Without this cache, the
// tests will fail. Reason being the tests need to exercise subsequent requests
// to make sure the ETag middleare is doing its job. For example, one request
// will be sent and it will be given an ETag header value. That value will be
// cached by the ETag middleware. When a second request is sent, the ETag
// middleware will:
//
// - hash the response of the request;
// - use the hash to see if it exists in its cache; and
// - send a 304 response if the hash exists.
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
  Deno.test("ETag", async (t) => {
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

              const response = await chain.handle<Response>(req);

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
      `ETag test failed in ${system}:`,
      `\n  Response body does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.headers.get("etag"),
    expectedResponse.headers?.etag,
    assertionMessage(
      `ETag test failed in ${system}:`,
      `\n  Response "etag" header does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  const actualLastModifiedDate = new Date(
    actualResponse.headers.get("last-modified")!,
  );

  // The `last-modified` header should be dated as "right now" because
  asserts.assertEquals(
    actualLastModifiedDate.toISOString().replace(
      /:[0-9]+\.+[0-9]+Z/,
      "",
    ),
    date(),
    assertionMessage(
      `ETag test failed in ${system}:`,
      `\n  Response "last-modified" header does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.status,
    expectedResponse.status,
    assertionMessage(
      `ETag test failed in ${system}:`,
      `\n  Response status does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.statusText,
    expectedResponse.statusText,
    assertionMessage(
      `Test failed in ${system}` +
        `\n\nResponse statusText does not match expected.` +
        `\n\nSee getTestCases()[${testCaseIndex}].requests[${requestIndex}]`,
    ),
  );
}

/**
 * A date to use for asserting the "last-modified" header.
 *
 * Assertions for "last-modified" headers are done in the test. The assertion is
 * just, "... the `last-modified` header should be NOW," so it is just doing a
 * `new Date()` comparison with the seconds taken off.
 */
function date() {
  return new Date().toISOString().replace(/:[0-9]+\.+[0-9]+Z/, "");
}

function getTestCases(): TestCase[] {
  return [
    {
      chain: chain({ middleware: [getEtagMiddleware()] }),
      requests: [
        // Send the first request
        {
          request: {
            method: Method.GET,
            path: "/",
          },
          expected_response: {
            body: "Hello from Home.GET()!",
            status: StatusCode.OK,
            statusText: StatusDescription.OK,
            headers: {
              etag: `"16-SGVsbG8gZnJvbSBIb21lLkdFVCgpIQ=="`,
            },
          },
        },
        // ETag middleware should keep track of the etag header it made above
        {
          request: {
            headers: {
              "if-none-match": `"16-SGVsbG8gZnJvbSBIb21lLkdFVCgpIQ=="`,
            },
            method: Method.GET,
            path: "/",
          },
          expected_response: {
            body: "", // Body should be empty when using `.text()`
            headers: {
              etag: `"16-SGVsbG8gZnJvbSBIb21lLkdFVCgpIQ=="`, // We should get the same etag back
            },
            status: StatusCode.NotModified, // Response should be considered "not modified"
            statusText: StatusDescription.NotModified,
          },
        },
        // If we send the same request without the `if-none-match` header, then ...
        {
          request: {
            method: Method.GET,
            path: "/",
          },
          expected_response: {
            body: "Hello from Home.GET()!", // Body should be the body in the first request
            headers: {
              etag: `"16-SGVsbG8gZnJvbSBIb21lLkdFVCgpIQ=="`, // We should get the same etag back
            },
            status: StatusCode.OK, // Response is new so it SHOULD NOT be considered "not modified"
            statusText: StatusDescription.OK,
          },
        },
      ],
    },
    {
      chain: chain({
        middleware: [getEtagMiddleware({ logs: false })],
        resources: [
          class Users extends Chain.Resource {
            public paths = ["/users/:id?"];
            #number_of_requests_received = 0;

            public GET(request: Chain.HTTPRequest) {
              const id = request.params.pathParam("id");

              if (id) {
                this.#number_of_requests_received++;

                if (this.#number_of_requests_received === 3) {
                  return;
                }

                return new Response(`Hello user #${id}`);
              }

              return new Response("Hello from Users.GET()!");
            }
          },
        ],
      }),
      requests: [
        // Send the first request with its etag that does not exist yet
        {
          request: {
            method: Method.GET,
            path: "/users",
            headers: {
              "if-none-match": `"17-SGVsbG8gZnJvbSBVc2Vycy5HRVQoKSE="`,
            },
          },
          expected_response: {
            body: "Hello from Users.GET()!", // This the etag did not exist, this response should contain the body
            status: StatusCode.OK, // It should not have a 304 Not Modified
            statusText: StatusDescription.OK, // It should not have a status code description associated with 304 Not Modified
            headers: {
              etag: `"17-SGVsbG8gZnJvbSBVc2Vycy5HRVQoKSE="`,
            },
          },
        },
        {
          request: {
            method: Method.GET,
            path: "/users",
          },
          expected_response: {
            body: "Hello from Users.GET()!",
            status: StatusCode.OK,
            statusText: StatusDescription.OK,
            headers: {
              etag: `"17-SGVsbG8gZnJvbSBVc2Vycy5HRVQoKSE="`,
            },
          },
        },
        // ETag middleware should keep track of the etag header it made above
        {
          request: {
            headers: {
              "if-none-match": `"17-SGVsbG8gZnJvbSBVc2Vycy5HRVQoKSE="`,
            },
            method: Method.GET,
            path: "/users",
          },
          expected_response: {
            body: "", // Body should be empty when using `.text()`
            status: StatusCode.NotModified, // Response should be considered "not modified"
            statusText: StatusDescription.NotModified,
            headers: {
              etag: `"17-SGVsbG8gZnJvbSBVc2Vycy5HRVQoKSE="`, // We should get the same etag back
            },
          },
        },
        // If we hit the same endpoint and provide a path param, then ...
        {
          request: {
            method: Method.GET,
            path: "/users/1",
          },
          expected_response: {
            body: "Hello user #1", // Body should be the one set in the `if (id) { ... }` conditional in the resource
            status: StatusCode.OK, // Response is new so it SHOULD NOT be considered "not modified"
            statusText: StatusDescription.OK,
            headers: {
              etag: `"d-SGVsbG8gdXNlciAjMQ=="`, // We should have a different etag
            },
          },
        },
        // If we send the first request again with the "if-none-match" etag, then ...
        {
          request: {
            method: Method.GET,
            path: "/users",
            headers: {
              "if-none-match": `"17-SGVsbG8gZnJvbSBVc2Vycy5HRVQoKSE="`,
            },
          },
          expected_response: {
            body: "", // The body should be empty because the response to the request has not been modified
            status: StatusCode.NotModified, // The response should have the Not Modified status
            statusText: StatusDescription.NotModified,
            headers: {
              etag: `"17-SGVsbG8gZnJvbSBVc2Vycy5HRVQoKSE="`, // We should get the same etag back
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
function getEtagMiddleware(
  options: Options & { logs?: boolean } = defaultOptions,
) {
  if (!options.logs) {
    return ETag(options);
  }

  return class ETagLogged extends ETagMiddleware {
    constructor() {
      super(options);
    }

    ALL(request: Request): Promise<Response> {
      return Promise
        .resolve()
        .then(() => this.next<Response>(request))
        .then((response) => ({ request, response }))
        .then((context) => {
          console.log(`Calling handleIfResponseEmpty()`);
          const ret = this.handleIfResponseEmpty(context);
          if (ret.done) {
            console.log(`done`);
          }
          return ret;
        })
        .then((context) => this.createEtagHeader(context))
        .then((context) => {
          console.log(`Calling handleEtagMatchesRequestIfNoneMatchHeader()`);
          const ret = this.handleEtagMatchesRequestIfNoneMatchHeader(context);
          if (ret.done) {
            console.log(`done`);
          }
          return ret;
        })
        .then((context) => {
          console.log(`Calling sendResponse()`);
          console.log({ response: context.response });
          return this.sendResponse(context);
        });
    }
  };
}
