import members from "../../members.ts";
import { STATUS_TEXT, Status } from "../../../deps.ts";

let server = new members.Drash.Http.Server({});
let request = members.mockRequest("/", "get", {
  headers: {
    "Response-Content-Type-Default": "application/json"
  }
});
request = server.getRequest(request);

let response = new members.Drash.Http.Response(request);
response.body = "This is my body";
let responseFormatted;

members.test("Response.generateResponse()", () => {
  members.assert.equal(JSON.parse(response.generateResponse()), "This is my body");
});

members.test("Response.generateResponse(): text/html", () => {
  response.headers.set("Content-Type", "text/html");
  responseFormatted = response.generateResponse();
  members.assert.equal(responseFormatted, `This is my body`);
});

members.test("Response.generateResponse(): text/xml", () => {
  response.headers.set("Content-Type", "text/xml");
  responseFormatted = response.generateResponse();
  members.assert.equal(responseFormatted, `This is my body`);
  response.headers.set("Content-Type", "application/xml");
  responseFormatted = response.generateResponse();
  members.assert.equal(responseFormatted, `This is my body`);
});
