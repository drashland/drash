import members from "../../members.ts";

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

members.test(async function Server_handleHttpRequest_middleware() {
  let server = new members.MockServer({
    middleware: [VerifyCsrfToken],
    resources: [ResourceWithMiddleware]
  });

  server.handleHttpRequest(members.mockRequest("/users/1"))
    .then((response) => {
      members.assert.equal(
        members.decoder.decode(response.body),
        `{"status_code":401,"status_message":"Unauthorized","request":{"url":"/","method":"GET"},"body":null}`
      );
    });
});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

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

class VerifyCsrfToken extends members.Drash.Http.Middleware {
  public run(request: any) {
    if (!request.getHeaderVar('csrf_token')) {
      throw new members.Drash.Exceptions.HttpException(400);
    }
  }
}

class ResourceWithMiddleware extends members.Drash.Http.Resource {
  static paths = ["/user/:id", "/user/:id/"];
  static middleware = ["Admin"];
  public users = {
    1: {
      name: "Thor"
    },
    2: {
      name: "Hulk"
    },
  };
  public GET() {
    this.response.body = {};
    return this.response;
  }
}
