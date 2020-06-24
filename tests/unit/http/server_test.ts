import { Rhum } from "../../test_deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();

Rhum.testPlan("http/server_test.ts", () => {
  Rhum.testSuite("constrcutor()", () => {
    Rhum.testCase("Throw error when incorrect template engine configs", () => {
      try {
        new Drash.Http.Server({
          template_engine: true,
        });
        Rhum.asserts.assertEquals(true, false);
      } catch (err) {
        Rhum.asserts.assertEquals(
          err.message,
          "Property missing. The views_path must be defined if template_engine is true",
        );
      }
    });
  });

  Rhum.testSuite("getRequest()", () => {
    Rhum.testCase("gives get*Param/File methods", async () => {
      const server = new Drash.Http.Server({
        resources: [HomeResource],
      });
      let request = Rhum.mocks.ServerRequest();
      request = await server.getRequest(request);
      Rhum.asserts.assertEquals("function", typeof request.getBodyFile);
      Rhum.asserts.assertEquals("function", typeof request.getBodyParam);
      Rhum.asserts.assertEquals("function", typeof request.getHeaderParam);
      Rhum.asserts.assertEquals("function", typeof request.getUrlQueryParam);
    });
    Rhum.testCase("request.body takes in a reader", async () => {
      const server = new Drash.Http.Server({
        resources: [HomeResource],
      });
      let request = new members.ServerRequest();
      const body = encoder.encode(JSON.stringify({
        hello: "world",
      }));
      request.url = "/";
      request.headers = new Headers();
      request.headers.set("Content-Length", body.length.toString());
      request.headers.set("Content-Type", "application/json");
      const reader = new Deno.Buffer(body as ArrayBuffer);
      request.r = new members.BufReader(reader);
      const newRequest = await server.getRequest(request);
      Rhum.asserts.assertEquals("world", newRequest.getBodyParam("hello"));
    });
  });

  Rhum.testSuite("handleHttpRequest()", () => {
    Rhum.testCase("/favicon.ico", async () => {
      const server = new Drash.Http.Server({
        resources: [HomeResource],
      });
      const request = Rhum.mocks.ServerRequest("/favicon.ico");
      const response = JSON.parse(await server.handleHttpRequest(request));
      Rhum.asserts.assertEquals(200, response.status_code);
    });

    Rhum.testCase("GET", async () => {
      const server = new Drash.Http.Server({
        resources: [HomeResource],
      });
      const request = Rhum.mocks.ServerRequest("/");
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        members.responseBody(response),
        { body: "got" },
      );
    });

    Rhum.testCase("POST", async () => {
      const server = new Drash.Http.Server({
        resources: [HomeResource],
      });
      const body = encoder.encode(JSON.stringify({
        body_param: "hello",
      }));
      const reader = new Deno.Buffer(body as ArrayBuffer);
      const request = Rhum.mocks.ServerRequest("/", "post", {
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

    Rhum.testCase("getPathParam() for :id", async () => {
      const server = new Drash.Http.Server({
        resources: [NotesResource, UsersResource],
      });
      let request;
      let response;
      request = Rhum.mocks.ServerRequest("/users/1");
      response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(members.responseBody(response), {
        user_id: "1",
      });
      request = Rhum.mocks.ServerRequest("/notes/1557");
      response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(members.responseBody(response), {
        note_id: "1557",
      });
    });

    Rhum.testCase("getHeaderParam()", async () => {
      const server = new Drash.Http.Server({
        resources: [GetHeaderParam],
      });
      const request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          id: 12345,
        },
      });
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(members.responseBody(response), {
        header_param: "12345",
      });
    });

    Rhum.testCase("getUrlQueryParam()", async () => {
      const server = new Drash.Http.Server({
        resources: [GetUrlQueryParam],
      });
      const request = Rhum.mocks.ServerRequest("/?id=123459");
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(members.responseBody(response), {
        query_param: "123459",
      });
    });

    Rhum.testCase("response.redirect()", async () => {
      const server = new Drash.Http.Server({
        resources: [NotesResource],
      });
      let request;
      let response;
      request = Rhum.mocks.ServerRequest("/notes/123", "get", {
        server: server,
      });
      response = await server.handleHttpRequest(request);
      Rhum.asserts.assertEquals(response.status, 302);
      Rhum.asserts.assertEquals(
        response.headers.get("location"),
        "/notes/1557",
      );
      request = Rhum.mocks.ServerRequest("/notes/1234", "get", {
        server: server,
      });
      response = await server.handleHttpRequest(request);
      Rhum.asserts.assertEquals(response.status, 301);
      Rhum.asserts.assertEquals(
        response.headers.get("location"),
        "/notes/1667",
      );
    });
  });

  Rhum.testSuite("handleHttpRequestError()", () => {
    Rhum.testCase("Returns the correct response", async () => {
      const request = Rhum.mocks.ServerRequest("/", "get");
      const server = new Drash.Http.Server({});
      const error = {
        code: 404,
        message: "Some error message",
      };
      const response = await server.handleHttpRequestError(request, error);
      Rhum.asserts.assertEquals(response.status, 404);
      Rhum.asserts.assertEquals(
        new TextDecoder().decode(response.body),
        "Some error message",
      );
    });
  });

  Rhum.testSuite("handleHttpRequestForFavicon", () => {
    Rhum.testCase("Returns the correct response", async () => {
      const request = Rhum.mocks.ServerRequest("/favicon.ico", "get");
      const server = new Drash.Http.Server({});
      const response = await server.handleHttpRequestForFavicon(request);
      Rhum.asserts.assertEquals(JSON.parse(response), {
        body: "",
        status_code: 200,
        request: {
          done: {},
          _body: null,
          finalized: false,
          url: "/favicon.ico",
          method: "get",
          headers: {},
        },
        headers: {},
      });
    });
  });

  Rhum.testSuite("handleHttpRequestForStaticPathAsset", () => {
    // TODO(any) How do we test this?
  });

  Rhum.testSuite("getResourceObject()", () => {
    Rhum.testCase("Returns the correct data", () => {
      class Resource extends Drash.Http.Resource {
        static paths = ["/", "/home"];
        public GET() {
          this.response.body = "Hello world!";
          return this.response;
        }
      }
      const server = new Drash.Http.Server({
        resources: [Resource],
      });
      const request = Rhum.mocks.ServerRequest("/");
      const resourceObject = server.getResourceObject(Resource, request);
      Rhum.asserts.assertEquals(resourceObject.paths, [
        {
          og_path: "/",
          regex_path: "^//?$",
          params: [],
        },
        {
          og_path: "/home",
          regex_path: "^/home/?$",
          params: [],
        },
      ]);
    });
  });

  Rhum.testSuite("run()", () => {
    Rhum.testCase("Runs the server and returns it", () => {
      // TODO(ebebbington) How do we test this?
    });
  });

  Rhum.testSuite("runTLS()", () => {
    Rhum.testCase("Runs the server and returns it", () => {
      // TODO(ebebbington) How do we test this?
    });
  });

  Rhum.testSuite("close()", () => {
    Rhum.testCase("Closes the server", async () => {
      const server = new Drash.Http.Server({});
      await server.run({
        hostname: "localhost",
        port: 1667,
      });
      Rhum.asserts.assertEquals(server.deno_server.closing, false);
      server.close();
      Rhum.asserts.assertEquals(server.deno_server.closing, true);
    });
  });
});

Rhum.run();

// FILE MARKER - DATA //////////////////////////////////////////////////////////

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
