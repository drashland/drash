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

import { Socket } from "node:net";
import { IncomingMessage, ServerResponse } from "node:http";

import { handleRequest } from "./app";

describe.only("Native - Convert IncomingMessage/ServerResponse to Request/Response", () => {
  describe.each(testCases())(
    "Home / paths = /",
    ({ method, expected }) => {
      it(`${method} returns ${expected.status}`, async () => {
        const req = new IncomingMessage(new Socket());
        req.method = method;
        const res = new ServerResponse(req);

        await handleRequest(req, res);
        const body = getBody(res);

        expect(body).toBe(expected.body);
        expect(res.statusCode).toBe(expected.status);
      });
    },
  );

  describe.each(testCasesNotFound())(
    "Non-existent endpoints / path = test",
    ({ method, expected }) => {
      it(`${method} returns ${expected.status}`, async () => {
        const req = new IncomingMessage(new Socket());
        req.url = `/test`;
        req.method = method;
        const res = new ServerResponse(req);

        await handleRequest(req, res);
        const body = getBody(res);

        expect(body).toBe(expected.body);
        expect(res.statusCode).toBe(expected.status);
      });
    },
  );
});

function getBody(response: ServerResponse<IncomingMessage>) {
  const json = JSON.parse(JSON.stringify(response));

  const body: string[] = [];

  for (const output of json.outputData) {
    body.push(output.data.replace(json._header, ""));
  }

  return body.join("");
}

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
