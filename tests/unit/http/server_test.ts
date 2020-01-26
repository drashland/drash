import members from "../../members.ts";

members.test("Server.handleHttpRequest(): GET", async () => {
  let server = new members.MockServer({
    address: "localhost:1557",
    resources: [HomeResource]
  });

  server.run();

  let response = await members.fetch.get("http://localhost:1557");

  members.assert.responseJsonEquals(await response.text(), {body: "got"});

  server.deno_server.close();
});

members.test("Server.handleHttpRequest(): POST", async () => {
  let server = new members.MockServer({
    address: "localhost:1557",
    resources: [HomeResource]
  });

  server.run();

  const response = await members.fetch.post("http://localhost:1557", {
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      body_param: "hello"
    }
  });

  members.assert.responseJsonEquals(await response.text(), {body: "hello"});

  server.deno_server.close();
});

members.test("Server.handleHttpRequest(): getPathParam() for :id and {id}", async () => {
  let server = new members.MockServer({
    address: "localhost:1557",
    resources: [
      NotesResource,
      UsersResource,
    ]
  });

  server.run();

  let response;

  response = await members.fetch.get("http://localhost:1557/users/1");

  members.assert.responseJsonEquals(await response.text(), {user_id: "1"});

  response = await members.fetch.get("http://localhost:1557/notes/1557");

  members.assert.responseJsonEquals(await response.text(), {note_id: "1557"});

  server.deno_server.close();
});

members.test("Server.handleHttpRequest(): getHeaderParam()", async () => {
  let server = new members.MockServer({
    address: "localhost:1557",
    resources: [GetHeaderParam]
  });

  server.run();

  let response = await members.fetch.get("http://localhost:1557", {
    headers: {
      id: 12345
    }
  });

  members.assert.responseJsonEquals(await response.text(), {header_param: "12345"})

  server.deno_server.close();
});

members.test("Server.handleHttpRequest(): getQueryParam()", async () => {
  let server = new members.MockServer({
    address: "localhost:1557",
    resources: [GetQueryParam]
  });

  server.run();

  let response = await members.fetch.get("http://localhost:1557?id=123459");

  members.assert.responseJsonEquals(await response.text(), {query_param: "123459"});

  server.deno_server.close();
});

members.test("Server.handleHttpRequest(): POST multipart/form-data", async () => {
  let body = await new TextDecoder().decode(await Deno.readAll(await Deno.open("./tests/data/multipart_1.txt")));
  let boundary = members.Drash.Services.HttpService.getMultipartFormDataBoundary(body);
  let parsed = await members.Drash.Services.HttpService.parseMultipartFormDataParts(body, boundary);

  let expected = {
    foo: {
      "content_disposition": "form-data",
      "size": null,
      "name": "foo",
      "filename": null,
      "content_type": "application/octet-stream",
      "contents": "foo\n"
    },
    bar: {
      "content_type": "application/octet-stream",
      "content_disposition": "form-data",
      "size": null,
      "name": "bar",
      "filename": null,
      "contents": "bar\n"
    },
    file: {
      "content_disposition": "form-data",
      "size": null,
      "name": "file",
      "filename": "tsconfig.json",
      "content_type": "application/octet-stream",
      "contents": `{
  "compilerOptions": {
    "target": "es2018",
    "baseUrl": ".",
    "paths": {
      "deno": ["./deno.d.ts"],
      "https://*": ["../../.deno/deps/https/*"],
      "http://*": ["../../.deno/deps/http/*"]
    }
  }
}
`
    }
  };

  members.assert.equals(parsed, expected);
});

members.test("Server.handleHttpRequest(): POST multipart/form-data - one part", async () => {
  let body = await new TextDecoder().decode(await Deno.readAll(await Deno.open("./tests/data/multipart_2.txt")));
  let boundary = members.Drash.Services.HttpService.getMultipartFormDataBoundary(body);
  let parsed = await members.Drash.Services.HttpService.parseMultipartFormDataParts(body, boundary);

  let expected = {
    file: {
      "content_disposition": "form-data",
      "size": null,
      "name": "file",
      "filename": "hello.txt",
      "content_type": "text/plain",
      "contents": "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
        + "test\n"
    }
  };

  members.assert.equals(parsed, expected);
});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class MultipartFormData extends members.Drash.Http.Resource {
  static paths = ["/"];
  public POST() {
    this.response.body = {body: this.request.getBodyMultipartForm("body_param")};
    return this.response;
  }
}

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
