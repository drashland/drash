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

class UserResource extends members.Drash.Http.Resource {
  static paths = ["/user/:id", "/user/:id/"];
  public GET() {
    this.response.body = {};
    return this.response;
  }
}

members.test(function Server_handleHttpRequest() {
  let request;
  let response;
  let server = new members.Drash.Http.Server({
    resources: [HomeResource]
  });

  request = members.mockRequest();
  response = server.handleHttpRequest(request);
  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
  );

  // request = members.mockRequest("/", "POST");
  // response = server.handleHttpRequest(request);
  // members.assert.equal(
  //   response,
  //   `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"POST"},"body":"got this"}`
  // );
});

members.test(function Server_handleHttpRequestError() {
  let request;
  let response;
  let server = new members.Drash.Http.Server({
    resources: [UserResource]
  });

  request = members.mockRequest();
  response = server.handleHttpRequest(request);
  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":404,"status_message":"Not Found","request":{"url":"/","method":"GET"},"body":"The requested URL '/' was not found on this server."}`
  );

  request = members.mockRequest("/user/1", "POST");
  response = server.handleHttpRequest(request);
  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":405,"status_message":"Method Not Allowed","request":{"url":"/user/1","method":"POST"},"body":"URI '/user/1' does not allow POST requests."}`
  );
});
