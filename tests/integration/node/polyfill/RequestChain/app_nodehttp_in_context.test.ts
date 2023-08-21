// Node imports
import { Socket } from "net";
import { IncomingMessage, ServerResponse } from "http";

// Test setup imports
import { send } from "./app_nodehttp_in_context";
import {
  testCases,
  testCasesNotFound,
} from "./test_data";

describe("Polyfill - Using IncomingMessage/ServerResponse in context object", () => {
  describe.each(testCases)(
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

  describe.each(testCasesNotFound)(
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
