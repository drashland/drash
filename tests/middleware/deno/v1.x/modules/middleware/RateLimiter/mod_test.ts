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
  chain,
  query,
  testCaseName,
} from "../../../../utils.ts";
import { StatusCode } from "../../../../../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../src/core/http/response/StatusDescription.ts";
import { Method } from "../../../../../../../src/core/http/request/Method.ts";
import * as Chain from "../../../../../../../src/modules/chains/RequestChain/mod.native.ts";
import { Handler } from "../../../../../../../src/standard/handlers/Handler.ts";
import {
  type Options,
  RateLimiter,
  RateLimiterMiddleware,
} from "../../../../../../../src/modules/middleware/RateLimiter/mod.ts";
import { RateLimiterErrorResponse } from "../../../../../../../src/modules/middleware/RateLimiter/RateLimiterErrorResponse.ts";
import { Header } from "../../../../../../../src/core/http/Header.ts";

type TestCase = {
  chain: Handler;
  middleware_options: Options;
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
    headers: Headers;
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
      .catch((error: RateLimiterErrorResponse) => {
        return error.response;
      });
  },
);

function runTests() {
  Deno.test("RateLimiter", async (t) => {
    await t.step("Deno Tests (using the chain in a Deno server)", async (t) => {
      const testCases = getTestCases();

      for (const [testCaseIndex, entry] of testCases.entries()) {
        const testCase = (typeof entry === "function") ? entry() : entry;

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
                testCase.middleware_options,
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

      for (const [testCaseIndex, entry] of testCases.entries()) {
        const testCase = (typeof entry === "function") ? entry() : entry;

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
                .catch((error: RateLimiterErrorResponse) => {
                  return error.response;
                });

              await assert(
                "Drash",
                testCaseIndex,
                testCase.middleware_options,
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
  middlewareOptions: Options,
  request: Request,
  requestIndex: number,
  actualResponse: Response,
  expectedResponse: Expected,
) {
  asserts.assertEquals(
    await actualResponse.clone().text(),
    expectedResponse.body,
    assertionMessage(
      `RateLimiter test failed in ${system}:`,
      `\n  Response body does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.headers.get("x-ratelimit-limit"),
    expectedResponse.headers.get("x-ratelimit-limit"),
    assertionMessage(
      `RateLimiter test failed in ${system}:`,
      `\n  Response "x-ratelimit-limit" header does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.headers.get("x-ratelimit-remaining"),
    expectedResponse.headers.get("x-ratelimit-remaining"),
    assertionMessage(
      `RateLimiter test failed in ${system}:`,
      `\n  Response "x-ratelimit-remaining" header does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  const rateLimitResetActual = actualResponse.headers.get(
    "x-ratelimit-reset",
  );
  const rateLimitResetExpected = expectedResponse.headers.get(
    "x-ratelimit-reset",
  );

  if (rateLimitResetActual === null || rateLimitResetExpected === null) {
    asserts.assertEquals(
      rateLimitResetActual, // This should be null ...
      rateLimitResetExpected, // ... and this should be null
      assertionMessage(
        `RateLimiter test failed in ${system}:`,
        `\n  Actual "x-ratelimit-reset" header ${rateLimitResetActual} does not match expected (${rateLimitResetExpected}).`,
        `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
        `\n  ${request.method} ${request.url.replace(url, "")}`,
      ),
    );
  } else {
    // If the "x-ratelimit-reset" header is not null, then we assert the seconds
    // that have gone by since the test started to when this assertion is made

    const timeSetInExpectedHeader = parseInt(rateLimitResetExpected); // This occurs first (when the test runs)
    const timeWhenMiddlewareProcessedRequest = parseInt(rateLimitResetActual); // This occurs second (during the test)

    asserts.assertEquals(
      timeSetInExpectedHeader <= timeWhenMiddlewareProcessedRequest,
      true,
      assertionMessage(
        `RateLimiter test failed in ${system}:`,
        `\n  Expected "x-ratelimit-reset" header time is not BEFORE actual time.\n`,
        `  Time set in expected header: ${timeSetInExpectedHeader}`,
        `  Time set in middleware:      ${timeWhenMiddlewareProcessedRequest}`,
        `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
        `\n  ${request.method} ${request.url.replace(url, "")}`,
      ),
    );

    const timeNow = Date.now() +
      middlewareOptions.rate_limit_time_window_length;

    asserts.assertEquals(
      timeWhenMiddlewareProcessedRequest <= timeNow,
      true,
      assertionMessage(
        `RateLimiter test failed in ${system}:`,
        `\n  Actual "x-ratelimit-reset" header time is not BEFORE time NOW.\n`,
        `  Time now:               ${timeNow} (+${middlewareOptions.rate_limit_time_window_length} added)`,
        `  Time set in middleware: ${timeWhenMiddlewareProcessedRequest}`,
        `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
        `\n  ${request.method} ${request.url.replace(url, "")}`,
      ),
    );

    asserts.assertEquals(
      new Date(timeWhenMiddlewareProcessedRequest).toUTCString(),
      actualResponse.headers.get("retry-after")!,
      assertionMessage(
        `RateLimiter test failed in ${system}:`,
        `\n  Actual "x-ratelimit-reset" header time is not BEFORE time NOW.\n`,
        `  Time now:               ${timeNow} (+${middlewareOptions.rate_limit_time_window_length} added)`,
        `  Time set in middleware: ${timeWhenMiddlewareProcessedRequest}`,
        `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
        `\n  ${request.method} ${request.url.replace(url, "")}`,
      ),
    );
  }

  const actualContentType = actualResponse.headers.get("content-type");

  if (actualContentType) {
    asserts.assertEquals(
      actualContentType,
      expectedResponse.headers.get("content-type"),
      assertionMessage(
        `RateLimiter test failed in ${system}:`,
        `\n  Actual "content-type" header does not match expected.\n`,
        `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
        `\n  ${request.method} ${request.url.replace(url, "")}`,
      ),
    );
  }

  const xThrottledHeader = actualResponse.headers.get("x-throttled");

  if (xThrottledHeader) {
    asserts.assertEquals(
      xThrottledHeader,
      expectedResponse.headers.get("x-throttled"),
      assertionMessage(
        `RateLimiter test failed in ${system}:`,
        `\n  Actual "x-throttled" header does not match expected.\n`,
        `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
        `\n  ${request.method} ${request.url.replace(url, "")}`,
      ),
    );
  }

  asserts.assertEquals(
    actualResponse.headers.get("x-retry-after"),
    expectedResponse.headers.get("x-retry-after"),
    assertionMessage(
      `RateLimiter test failed in ${system}:`,
      `\n  Response "x-retry-after" header does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.status,
    expectedResponse.status,
    assertionMessage(
      `RateLimiter test failed in ${system}:`,
      `\n  Response status does not match expected.`,
      `\nSee test case index [${testCaseIndex}] request index [${requestIndex}] containing:`,
      `\n  ${request.method} ${request.url.replace(url, "")}`,
    ),
  );

  asserts.assertEquals(
    actualResponse.statusText,
    expectedResponse.statusText,
    assertionMessage(
      `RateLimiter test failed in ${system}` +
        `\n\nResponse statusText does not match expected.` +
        `\n\nSee getTestCases()[${testCaseIndex}].requests[${requestIndex}]`,
    ),
  );
}

function getTestCases(): (() => TestCase)[] {
  return [
    () => {
      const options = {
        // Middleware options
        client_id_header_name: "x-connecto-patronum",
        max_requests: 3,
        rate_limit_time_window_length: 1000 * 60 * 2, // 2 minute time window
        throw_if_connection_header_name_missing: false,

        // Middleware decorator options
        logs: false,
      };

      const justBeforeEndTime = Date.now() +
        options.rate_limit_time_window_length;
      const rateLimitResetHeader = justBeforeEndTime.toString();

      return {
        chain: chain({
          middleware: [getRateLimiterMiddleware(options)],
          resources: [
            class Throttled extends Chain.Resource {
              public paths = ["/throttled/:id?"];

              public GET(request: Chain.HTTPRequest) {
                const id = request.params.pathParam("id");

                if (id) {
                  return new Response(
                    JSON.stringify({ message: "My headers should persist" }),
                    {
                      status: 200,
                      statusText: "OK",
                      headers: {
                        [Header.ContentType]: "application/json",
                        "x-throttled": "I should persist!",
                      },
                    },
                  );
                }

                return new Response("Hello from Throttled.GET()!", {
                  status: 200,
                  statusText: "OK",
                });
              }
            },
          ],
        }),
        middleware_options: options,
        requests: [
          // Request 0
          {
            // Given ...
            request: {
              method: Method.GET,
              path: "/throttled",
              headers: new Headers({
                // ... this request does not contain the `x-connecto-patronum` header
                "x-connecto": `this will not result in x-ratelimit-* headers`,
              }),
            },
            // When the request is made, then ...
            expected_response: {
              body: "Hello from Throttled.GET()!",
              status: StatusCode.OK, // ... the response is OK because `throw_if_connection_header_name_missing` is `false`
              statusText: StatusDescription.OK,
              headers: new Headers({
                "content-type": "text/plain;charset=UTF-8",
                // ... no x-ratelimit-* headers are present
              }),
            },
          },

          // Request 1
          {
            // Given ...
            request: {
              method: Method.GET,
              path: "/throttled",
              headers: new Headers({
                // ... this request contains the `x-connecto-patronum` header as `artic`
                "x-connecto-patronum": "artic",
              }),
            },
            // When the request is made, then ...
            expected_response: {
              body: "Hello from Throttled.GET()!",
              status: StatusCode.OK,
              statusText: StatusDescription.OK,
              headers: new Headers({
                "content-type": "text/plain;charset=UTF-8",
                "x-ratelimit-limit": "3",
                "x-ratelimit-remaining": "2", // ... this value should be the max requests allowed value minus 1
                "x-ratelimit-reset": rateLimitResetHeader,
              }),
            },
          },

          // Request 2
          {
            // Given ...
            request: {
              method: Method.GET,
              path: "/throttled",
              headers: {
                // ... this is the same client making another request
                "x-connecto-patronum": "artic",
              },
            },
            // When the request is made, then ...
            expected_response: {
              body: "Hello from Throttled.GET()!",
              status: StatusCode.OK,
              statusText: StatusDescription.OK,
              headers: new Headers({
                "content-type": "text/plain;charset=UTF-8",
                "x-ratelimit-limit": "3",
                "x-ratelimit-remaining": "1", // ... this value should be artic's last response's value minus 1
                "x-ratelimit-reset": rateLimitResetHeader,
              }),
            },
          },

          // Request 3
          {
            // Given ...
            request: {
              method: Method.GET,
              path: "/throttled",
              headers: {
                // ... this is a different client: `zap`
                "x-connecto-patronum": "zap",
              },
            },
            // When the request is made, then ...
            expected_response: {
              body: "Hello from Throttled.GET()!",
              status: StatusCode.OK,
              statusText: StatusDescription.OK,
              headers: new Headers({
                "content-type": "text/plain;charset=UTF-8",
                "x-ratelimit-limit": "3",
                "x-ratelimit-remaining": "2", // ... this should be the max requests allowed value minus 1
                "x-ratelimit-reset": rateLimitResetHeader,
              }),
            },
          },

          // Request 4
          {
            // Given ...
            request: {
              method: Method.GET,
              path: "/throttled",
              headers: {
                // ... this is the `artic` client again making its 3rd request in its rate limit time window
                "x-connecto-patronum": "artic",
              },
            },
            // When the request is made, then ...
            expected_response: {
              body: "Hello from Throttled.GET()!",
              status: StatusCode.OK,
              statusText: StatusDescription.OK,
              headers: new Headers({
                "content-type": "text/plain;charset=UTF-8",
                "x-ratelimit-limit": "3",
                "x-ratelimit-remaining": "0", // ... this value should be artic's last response's value minus 1
                "x-ratelimit-reset": rateLimitResetHeader,
              }),
            },
          },

          // Request 5
          {
            // Given ...
            request: {
              method: Method.GET,
              path: "/throttled",
              headers: {
                // ... this is the `artic` client again making its 4th request in its rate limit time window
                // ... and 3 is the maximum number of requests that can be made in a rate limit time window
                "x-connecto-patronum": "artic",
              },
            },
            // When the request is made, then ...
            expected_response: {
              body:
                "Too many requests. Next request can be made after the time set in the Retry-After header.",
              status: StatusCode.TooManyRequests, // ... this should be a 429
              statusText: StatusDescription.TooManyRequests, // ... this should be the 429's description
              headers: new Headers({
                "content-type": "text/plain;charset=UTF-8",
                "x-ratelimit-limit": "3",
                "x-ratelimit-remaining": "0", // ... this value should still be 0 because a client cannot have negative requests remaining
                "x-ratelimit-reset": rateLimitResetHeader,
              }),
            },
          },

          // Request 6
          {
            // Given ...
            request: {
              method: Method.GET,
              path: "/throttled/1337",
              headers: {
                // ... this is a new client: `mol`
                "x-connecto-patronum": "mol",
              },
            },
            // When the request is made, then ...
            expected_response: {
              body: JSON.stringify({ message: "My headers should persist" }),
              status: StatusCode.OK,
              statusText: StatusDescription.OK,
              headers: new Headers({
                "x-throttled": "I should persist!",
                "content-type": "application/json",
                "x-ratelimit-limit": "3",
                "x-ratelimit-remaining": "2", // ... this value should be the max number of requests minus 1
                "x-ratelimit-reset": rateLimitResetHeader,
              }),
            },
          },
        ],
      };
    },
  ];
}

const defaultOptions: Options = {
  rate_limit_time_window_length: 10000, // 10 seconds
  max_requests: 3,
  client_id_header_name: "x-client-id",
  throw_if_connection_header_name_missing: false,
};

/**
 * Helper function to use a decorated AcceptHeader middleware (with logs for
 * debugging purposes) or the original AcceptHeader middleware.
 */
function getRateLimiterMiddleware(
  options: Options & { logs?: boolean } = defaultOptions,
) {
  if (!options.logs) {
    return RateLimiter(options);
  }

  return new class RateLimiterLogged extends RateLimiterMiddleware {
    constructor() {
      super(options);
    }

    public ALL(request: Request): Promise<Response> {
      return Promise
        .resolve()
        .then(() => {
          console.log(`Calling setClientInContext()`);
          return this.setClientInContext(request);
        })
        .then((context) => {
          console.log(`Calling throwIfRateLimited()`);
          return this.throwIfRateLimited(context);
        })
        .then((context) => {
          console.log(`Calling sendToNext()`);
          return this.sendToNext(context);
        })
        .then((context) => {
          console.log(`Calling sendResponse()`);
          return this.sendResponse(context);
        });
    }
  }();
}
