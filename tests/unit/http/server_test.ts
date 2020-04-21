import members from "../../members.ts";

members.test("server_test.ts | handleHttpRequest(): GET", async () => {
  let server = new members.MockServer({
    resources: [HomeResource],
  });

  server.run({
    hostname: "localhost",
    port: 1557,
  });

  let response = await members.fetch.get("http://localhost:1557");

  members.assert.responseJsonEquals(await response.text(), { body: "got" });

  server.close();
});

members.test("server_test.ts | handleHttpRequest(): POST", async () => {
  let server = new members.MockServer({
    resources: [HomeResource],
  });

  server.run({
    hostname: "localhost",
    port: 1557,
  });

  const response = await members.fetch.post("http://localhost:1557", {
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      body_param: "hello",
    },
  });

  members.assert.responseJsonEquals(await response.text(), { body: "hello" });

  server.close();
});

members.test(
  "server_test.ts | handleHttpRequest(): getPathParam() for :id and {id}",
  async () => {
    let server = new members.MockServer({
      resources: [NotesResource, UsersResource],
    });

    server.run({
      hostname: "localhost",
      port: 1557,
    });

    let response;

    response = await members.fetch.get("http://localhost:1557/users/1");

    members.assert.responseJsonEquals(await response.text(), { user_id: "1" });

    response = await members.fetch.get("http://localhost:1557/notes/1557");

    members.assert.responseJsonEquals(await response.text(), {
      note_id: "1557",
    });

    server.close();
  },
);

members.test("server_test.ts | handleHttpRequest(): getHeaderParam()", async () => {
  let server = new members.MockServer({
    resources: [GetHeaderParam],
  });

  server.run({
    hostname: "localhost",
    port: 1557,
  });
  let response = await members.fetch.get("http://localhost:1557", {
    headers: {
      id: 12345,
    },
  });

  members.assert.responseJsonEquals(await response.text(), {
    header_param: "12345",
  });

  server.close();
});

members.test("server_test.ts | handleHttpRequest(): getUrlQueryParam()", async () => {
  let server = new members.MockServer({
    resources: [GetUrlQueryParam],
  });

  server.run({
    hostname: "localhost",
    port: 1557,
  });
  let response = await members.fetch.get("http://localhost:1557?id=123459");

  members.assert.responseJsonEquals(await response.text(), {
    query_param: "123459",
  });

  server.close();
});

members.test(
  "server_test.ts | handleHttpRequest(): response.redirect()",
  async () => {
    let server = new members.MockServer({
      resources: [NotesResource],
    });

    server.run({
      hostname: "localhost",
      port: 1557,
    });
    let response;

    response = await members.fetch.get("http://localhost:1557/notes/123");

    members.assert.responseJsonEquals(await response.text(), {
      note_id: "1557",
    });

    server.close();
  },
);

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class MultipartFormData extends members.Drash.Http.Resource {
  static paths = ["/"];
  public POST() {
    this.response.body = {
      body: this.request.getBodyMultipartForm("body_param"),
    };
    return this.response;
  }
}

class HomeResource extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = { body: "got" };
    return this.response;
  }
  public POST() {
    this.response.body = { body: this.request.getBodyParam("body_param") };
    return this.response;
  }
}

class UsersResource extends members.Drash.Http.Resource {
  static paths = ["/users/:id"];
  public GET() {
    this.response.body = { user_id: this.request.getPathParam("id") };
    return this.response;
  }
}

class NotesResource extends members.Drash.Http.Resource {
  static paths = ["/notes/{id}"];
  public GET() {
    const noteId = this.request.getPathParam("id");
    if (noteId === "123") {
      return this.response.redirect(302, "/notes/1557");
    }
    this.response.body = { note_id: noteId };
    return this.response;
  }
}

class GetHeaderParam extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = { header_param: this.request.getHeaderParam("id") };
    return this.response;
  }
}

class GetUrlQueryParam extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = { query_param: this.request.getUrlQueryParam("id") };
    return this.response;
  }
}
