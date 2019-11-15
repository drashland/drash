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

// TODO(crookse)
//     [ ] test request.body_parsed
//     [ ] test favicon.ico request
members.test(async function Server_handleHttpRequest_GET() {
  let server = new members.MockServer({
    resources: [HomeResource]
  });

  server.handleHttpRequest(members.mockRequest())
    .then((response) => {
      members.assert.equal(
        members.decoder.decode(response.body),
        `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
      );
    });
});

members.test(async function Server_handleHttpRequest_POST() {
  let server = new members.MockServer({
    resources: [HomeResource]
  });

  server.handleHttpRequest(members.mockRequest("/", "POST"))
    .then((response) => {
      members.assert.equal(
        members.decoder.decode(response.body),
        `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"POST"},"body":"got this"}`
      );
    });
});
