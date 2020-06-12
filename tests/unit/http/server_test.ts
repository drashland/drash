import members from "../../members.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();

members.testSuite("http/server_test.ts", () => {

  members.test("getRequest() gives get*Param/File methods", async () => {
    const server = new Drash.Http.Server({
      resources: [HomeResource]
    });
    let request = members.mockRequest();
    request = await server.getRequest(request);
    members.assertEquals("function", typeof request.getBodyFile);
    members.assertEquals("function", typeof request.getBodyParam);
    members.assertEquals("function", typeof request.getHeaderParam);
    members.assertEquals("function", typeof request.getUrlQueryParam);
  });

  members.test("getRequest() request.body takes in a reader", async () => {
    const server = new Drash.Http.Server({
      resources: [HomeResource]
    })
    let request = new members.ServerRequest();
    const body = encoder.encode(JSON.stringify({
      hello: "world",
    }));
    request.url = "/";
    request.headers = new Headers()
    request.headers.set("Content-Length", body.length.toString());
    request.headers.set("Content-Type", "application/json");
    const reader = new Deno.Buffer(body as ArrayBuffer);
    request.r = new members.BufReader(reader);
    const newRequest = await server.getRequest(request);
    members.assertEquals("world", newRequest.getBodyParam("hello"));
  });

  members.test("handleHttpRequest(): /favicon.ico", async () => {
    const server = new Drash.Http.Server({
      resources: [HomeResource],
    });
    const request = members.mockRequest("/favicon.ico");
    const response = JSON.parse(await server.handleHttpRequest(request));
    members.assertEquals(200, response.status_code);
  });

  members.test("handleHttpRequest(): GET", async () => {
    const server = new Drash.Http.Server({
      resources: [HomeResource],
    });
    const request = members.mockRequest("/");
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(
      members.responseBody(response),
      { body: "got" },
    );
  });

  members.test("handleHttpRequest(): POST", async () => {
    const server = new Drash.Http.Server({
      resources: [HomeResource],
    });
    const body = encoder.encode(JSON.stringify({
      body_param: "hello",
    }));
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const request = members.mockRequest("/", "post", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(
      members.responseBody(response),
      { body: "hello" },
    );
  });

  members.test("handleHttpRequest(): getPathParam() for :id", async () => {
    const server = new Drash.Http.Server({
      resources: [NotesResource, UsersResource],
    });
    let request;
    let response;
    request = members.mockRequest("/users/1");
    response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(members.responseBody(response), {
      user_id: "1",
    });
    request = members.mockRequest("/notes/1557");
    response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(members.responseBody(response), {
      note_id: "1557",
    });
  });

  members.test("handleHttpRequest(): getHeaderParam()", async () => {
    const server = new Drash.Http.Server({
      resources: [GetHeaderParam],
    });
    const request = members.mockRequest("/", "get", {
      headers: {
        id: 12345,
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(members.responseBody(response), {
      header_param: "12345",
    });
  });

  members.test("handleHttpRequest(): getUrlQueryParam()", async () => {
    const server = new Drash.Http.Server({
      resources: [GetUrlQueryParam],
    });
    const request = members.mockRequest("/?id=123459");
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(members.responseBody(response), {
      query_param: "123459",
    });
  });

  members.test("handleHttpRequest(): response.redirect()", async () => {
    const server = new Drash.Http.Server({
      resources: [NotesResource],
    });
    let request;
    let response;
    request = members.mockRequest("/notes/123", "get", {
      server: server,
    });
    response = await server.handleHttpRequest(request);
    members.assertEquals(response.status, 302);
    members.assertEquals(response.headers.get("location"), "/notes/1557");
    request = members.mockRequest("/notes/1234", "get", {
      server: server,
    });
    response = await server.handleHttpRequest(request);
    members.assertEquals(response.status, 301);
    members.assertEquals(response.headers.get("location"), "/notes/1667");
  });

  members.test("getResourceObject() returns the correct resource", async () => {
    const server = new Drash.Http.Server({
      resources: [HomeResource],
    });
    const request = members.mockRequest("/");
    const actual = await server.getResourceClass(request);
    members.assertEquals(HomeResource, actual);
  });

});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class MultipartFormData extends Drash.Http.Resource {
  static paths = ["/"];
  public POST() {
    this.response.body = {
      body: this.request.getBodyMultipartForm("body_param"),
    };
    return this.response;
  }
}

class HomeResource extends Drash.Http.Resource {
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

class UsersResource extends Drash.Http.Resource {
  static paths = ["/users/:id"];
  public GET() {
    this.response.body = { user_id: this.request.getPathParam("id") };
    return this.response;
  }
}

class NotesResource extends Drash.Http.Resource {
  static paths = ["/notes/{id}"];
  public GET() {
    const noteId = this.request.getPathParam("id");
    if (noteId === "123") {
      return this.response.redirect(302, "/notes/1557");
    }
    if (noteId === "1234") {
      return this.response.redirect(301, "/notes/1667");
    }
    this.response.body = { note_id: noteId };
    return this.response;
  }
}

class GetHeaderParam extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = { header_param: this.request.getHeaderParam("id") };
    return this.response;
  }
}

class GetUrlQueryParam extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = { query_param: this.request.getUrlQueryParam("id") };
    return this.response;
  }
}
