/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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

import * as asserts from "@std/assert";
import { Handler } from "../../../../src/standard/handlers/Handler.ts";
import { RequestParamsParser } from "../../../../src/standard/handlers/RequestParamsParser.ts";

/**
 * `RequestParamsParser` calls `sendToNextHandler()` unconditionally, and that
 * throws when nothing is linked after it. This stands in as the end of the
 * chain and hands the enriched input back so it can be asserted against.
 */
class Terminal extends Handler {
  override handle<Output>(input: unknown): Promise<Output> {
    return Promise.resolve(input as Output);
  }
}

type Params = {
  queryParam(param: string): string | undefined;
  pathParam(param: string): string | undefined;
};

/**
 * Run a URL through the handler and return the `params` object it defined.
 */
const parse = async (
  url: string,
  pathParams: Record<string, string | undefined> = {},
): Promise<Params> => {
  const parser = new RequestParamsParser();
  parser.setNext(new Terminal());

  const output = await parser.handle<{ request: { params: Params } }>({
    request: { url },
    // The handler only checks that this is an object.
    resource: {} as never,
    request_params: { path_params: pathParams },
  });

  return output.request.params;
};

const queryParamCases: {
  url: string;
  param: string;
  expected: string | undefined;
  reason: string;
}[] = [
  {
    url: "http://localhost:1447/users?id=1337",
    param: "id",
    expected: "1337",
    reason: "reads a lone query param",
  },
  {
    url: "http://localhost:1447/users?sort=asc&page=2",
    param: "sort",
    expected: "asc",
    reason: "reads the first of many query params",
  },
  {
    url: "http://localhost:1447/users?sort=asc&page=2",
    param: "page",
    expected: "2",
    reason: "reads a later query param",
  },
  {
    url: "http://localhost:1447/users?sort=asc&page=2&limit=10",
    param: "limit",
    expected: "10",
    reason: "reads the last query param",
  },
  {
    url: "http://localhost:1447/users",
    param: "sort",
    expected: undefined,
    reason: "returns undefined when there is no query string",
  },
  {
    url: "http://localhost:1447/users?",
    param: "sort",
    expected: undefined,
    reason: "returns undefined when the query string is empty",
  },
  {
    url: "http://localhost:1447/users?sort=asc",
    param: "page",
    expected: undefined,
    reason: "returns undefined for a param the client did not send",
  },
  {
    url: "/users?sort=asc",
    param: "sort",
    expected: "asc",
    reason: "reads from a relative URL without throwing",
  },
  {
    url: "http://localhost:1447/users?sort=asc&sort=desc",
    param: "sort",
    expected: "asc",
    reason: "returns the first value of a repeated param",
  },
  {
    url: "http://localhost:1447/users?q=hello%20world",
    param: "q",
    expected: "hello world",
    reason: "decodes a percent-encoded value",
  },
  {
    url: "http://localhost:1447/users?q=a%2Bb",
    param: "q",
    expected: "a+b",
    reason: "decodes an encoded plus sign",
  },
  {
    url: "http://localhost:1447/users?q=a+b",
    param: "q",
    expected: "a b",
    reason: "decodes a plus sign as a space",
  },
  {
    url: "http://localhost:1447/users?empty=",
    param: "empty",
    expected: "",
    reason: "distinguishes an empty value from an absent param",
  },
  {
    url: "http://localhost:1447/users?sort=asc#section",
    param: "sort",
    expected: "asc",
    reason: "does not fold a fragment into the value",
  },
  {
    url: "http://localhost:1447/users#section?sort=asc",
    param: "sort",
    expected: undefined,
    reason: "ignores a query string that sits inside the fragment",
  },
  {
    url: "http://localhost:1447/users/1?sort=asc",
    param: "sort",
    expected: "asc",
    reason: "is not confused by a path segment before the query string",
  },
];

Deno.test("RequestParamsParser", async (t) => {
  await t.step("queryParam()", async (t) => {
    for (const { url, param, expected, reason } of queryParamCases) {
      await t.step(`${reason} (\`${url}\` -> \`${param}\`)`, async () => {
        const params = await parse(url);

        asserts.assertEquals(params.queryParam(param), expected);
      });
    }
  });

  await t.step("pathParam()", async (t) => {
    await t.step("reads a matched path param", async () => {
      const params = await parse("http://localhost:1447/users/1337", {
        id: "1337",
      });

      asserts.assertEquals(params.pathParam("id"), "1337");
    });

    await t.step("returns undefined for an unmatched path param", async () => {
      const params = await parse("http://localhost:1447/users/1337", {
        id: "1337",
      });

      asserts.assertEquals(params.pathParam("name"), undefined);
    });

    await t.step(
      "does not read path params from the query string",
      async () => {
        const params = await parse("http://localhost:1447/users?id=1337");

        asserts.assertEquals(params.pathParam("id"), undefined);
      },
    );

    await t.step(
      "does not read query params from the path params",
      async () => {
        const params = await parse("http://localhost:1447/users/1337", {
          id: "1337",
        });

        asserts.assertEquals(params.queryParam("id"), undefined);
      },
    );
  });

  await t.step("params", async (t) => {
    await t.step("is defined as a non-enumerable property", async () => {
      const parser = new RequestParamsParser();
      parser.setNext(new Terminal());

      const request = { url: "http://localhost:1447/users?sort=asc" };

      await parser.handle({
        request,
        resource: {} as never,
        request_params: { path_params: {} },
      });

      // Non-enumerable keeps `params` out of `JSON.stringify(request)`, which
      // consumers rely on when they echo the request back.
      asserts.assertEquals(Object.keys(request), ["url"]);
      asserts.assertEquals(
        JSON.stringify(request),
        '{"url":"http://localhost:1447/users?sort=asc"}',
      );
      asserts.assert("params" in request);
    });
  });
});
