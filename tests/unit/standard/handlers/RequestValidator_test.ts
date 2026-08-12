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

import { asserts } from "../../../deps.ts";
import { HTTPError } from "../../../../src/core/errors/HTTPError.ts";
import { StatusCode } from "../../../../src/core/http/response/StatusCode.ts";
import { RequestValidator } from "../../../../src/standard/handlers/RequestValidator.ts";

const testCasesThrow = [
  {
    input: null,
    expected: "Request could not be read",
  },
  {
    input: undefined,
    expected: "Request could not be read",
  },
  {
    input: {},
    expected: "Request HTTP method could not be read",
  },
  {
    input: { url: "yep" },
    expected: "Request HTTP method could not be read",
  },
  {
    input: { method: "yep" },
    expected: "Request URL could not be read",
  },
  {
    input: { url: true },
    expected: "Request HTTP method could not be read",
  },
  {
    input: { method: false },
    expected: "Request HTTP method could not be read",
  },
  {
    input: { url: true, method: true },
    expected: "Request HTTP method could not be read",
  },
  {
    input: { hello: "yep" },
    expected: "Request HTTP method could not be read",
  },
  {
    input: true,
    expected: "Request could not be read",
  },
  {
    input: false,
    expected: "Request could not be read",
  },
];

Deno.test("RequestValidator", async (t) => {
  for (const request of testCasesThrow) {
    const testName = JSON.stringify(request.input);

    await t.step(`throws if request is \`${testName}\``, async () => {
      const requestValidator = new RequestValidator();

      const error = await asserts.assertRejects(
        // @ts-ignore: Ignoring because we want to test passing in incorrect
        // values
        () => requestValidator.handle(request.input),
        HTTPError,
        request.expected,
      );

      asserts.assertEquals(error.status_code, StatusCode.UnprocessableEntity);
    });
  }

  await t.step("throws if request is not provided", async () => {
    const requestValidator = new RequestValidator();

    const error = await asserts.assertRejects(
      // @ts-ignore: Ignoring because we want to test not passing in an arg for
      // cases where TypeScript is not being used
      () => requestValidator.handle(),
      HTTPError,
      "Request could not be read",
    );

    asserts.assertEquals(error.status_code, StatusCode.UnprocessableEntity);
  });

  await t.step(
    "does not throw if the object is `{ url: string; method: string }`",
    async () => {
      const requestValidator = new RequestValidator();
      const request = { url: "", method: "" };

      // With no next handler in the chain, the validated request is returned
      // as-is.
      asserts.assertStrictEquals(
        await requestValidator.handle(request),
        request,
      );
    },
  );
});
