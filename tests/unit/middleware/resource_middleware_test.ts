import members from "../../members.ts";

class HomeResource extends members.Drash.Http.Resource {
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

members.test(async function Server_handleHttpRequest_hook_beforeRequest() {
  let request;
  let response;
  let server = new members.Drash.Http.Server({
    resources: [MyBeforeRequestResource]
  });

  request = members.mockRequest();
  response = await server.handleHttpRequest(request);

  members.assert.equal(
    members.decoder.decode(await response.body),
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"hello, world"}`
  );
});
