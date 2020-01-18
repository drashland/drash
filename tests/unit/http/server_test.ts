import members from "../../members.ts";

members.test("Server.handleHttpRequest(): GET", async () => {
  let server = new members.MockServer({
    resources: [HomeResource]
  });

  let response = await server.handleHttpRequest(members.mockRequest());

  members.assert.responseJsonEquals(response.body, {body: "got"});
});

members.test("Server.handleHttpRequest(): POST", async () => {
  let server = new members.MockServer({
    address: "localhost:1447",
    resources: [HomeResource]
  });

  server.run();

  const response = await members.fetch.post("http://localhost:1447", {
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      body_param: "hello"
    }
  });

  members.assert.equal(JSON.parse(await response.text()), {body: "hello"});

  server.deno_server.close();
});

members.test("Server.handleHttpRequest(): getPathParam() for :id and {id}", async () => {
  let server = new members.MockServer({
    address: "localhost:1447",
    resources: [
      NotesResource,
      UsersResource,
    ]
  });

  server.run();

  let response;

  response = await members.fetch.get("http://localhost:1447/users/1");

  members.assert.equal(JSON.parse(await response.text()), {user_id: "1"});

  response = await members.fetch.get("http://localhost:1447/notes/1447");

  members.assert.equal(JSON.parse(await response.text()), {note_id: "1447"});

  server.deno_server.close();
});

members.test("Server.handleHttpRequest(): getHeaderParam()", async () => {
  let server = new members.MockServer({
    address: "localhost:1447",
    resources: [GetHeaderParam]
  });

  server.run();

  let response = await members.fetch.get("http://localhost:1447", {
    headers: {
      id: 12345
    }
  });

  members.assert.equal(JSON.parse(await response.text()), {header_param: "12345"})

  server.deno_server.close();
});

members.test("Server.handleHttpRequest(): getQueryParam()", async () => {
  let server = new members.MockServer({
    resources: [GetQueryParam]
  });

  let response = await server.handleHttpRequest(
    members.mockRequest("/?id=123459", "GET")
  );

  members.assert.responseJsonEquals(response.body, {query_param: "123459"});
});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = {body: "got"};
    return this.response;
  }
  public POST() {
    this.response.body = {body: this.request.getBodyParam("body_param")};
    return this.response;
  }
}

class UsersResource extends members.Drash.Http.Resource {
  static paths = ["/users/:id"];
  public GET() {
    this.response.body = {user_id: this.request.getPathParam("id")};
    return this.response;
  }
}

class NotesResource extends members.Drash.Http.Resource {
  static paths = ["/notes/{id}"];
  public GET() {
    this.response.body = {note_id: this.request.getPathParam("id")};
    return this.response;
  }
}

class GetHeaderParam extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = {header_param: this.request.getHeaderParam("id")};
    return this.response;
  }
}

class GetQueryParam extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = {query_param: this.request.getQueryParam("id")};
    return this.response;
  }
}
