import members from "../../members.ts";

members.test("Server.handleHttpRequest(): GET", async () => {
  let server = new members.MockServer({
    resources: [HomeResource]
  });

  let response = await server.handleHttpRequest(members.mockRequest());

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 200,
      status_message: "OK",
      body: "got",
      request: {
        method: "GET",
        uri: "/",
        url_query_params: {},
        url: "127.0.0.1:8000/"
      }
    }
  );
});

members.test("Server.handleHttpRequest(): POST", async () => {
  let server = new members.MockServer({
    resources: [HomeResource]
  });

  let response = await server.handleHttpRequest(
    members.mockRequest("/", "POST")
  );

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 200,
      status_message: "OK",
      body: "got this",
      request: {
        method: "POST",
        uri: "/",
        url_query_params: {},
        url: "127.0.0.1:8000/"
      }
    }
  );
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
