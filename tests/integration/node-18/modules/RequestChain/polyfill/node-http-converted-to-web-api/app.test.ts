import { Socket } from "net";
import { IncomingMessage, ServerResponse } from "http";
import { send } from "./app";

describe("Native - Convert IncomingMessage/ServerResponse to Request/Response", () => {
  describe.each(testCases())(
    "Home / paths = /",
    ({ method, expected }) => {
      it(`${method} returns ${expected.status}`, async () => {
        const req = new IncomingMessage(new Socket());
        req.method = method;
        const res = new ServerResponse(req);

        await send(req, res);
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

        await send(req, res);
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

  for (let output of json.outputData) {
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
