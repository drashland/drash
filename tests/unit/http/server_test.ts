import members from "../../members.ts";

class MyResource extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "got";
    return this.response;
  }
  public POST() {
    this.response.body = "got this";
    return this.response;
  }
}

let server = new members.Drash.Http.Server({
  resources: [MyResource]
});

members.test(async function Server_handleHttpRequest() {
  let request;
  let response;

  request = members.mockRequest();
  response = server.handleHttpRequest(request);
  members.assert.equal(response, `{"status_code":200,"status_message":"200 (OK)","request":{"url":"/","method":"GET"},"body":"got"}`);

  request = members.mockRequest("/", "POST");
  response = server.handleHttpRequest(request);
  members.assert.equal(response, `{"status_code":200,"status_message":"200 (OK)","request":{"url":"/","method":"POST"},"body":"got this"}`);
});

