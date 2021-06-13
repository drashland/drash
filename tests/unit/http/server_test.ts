import { Rhum } from "../../deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

Rhum.testPlan("http/server_test.ts", () => {
  Rhum.testSuite("handleHttpRequest()", () => {
    Rhum.testCase("request.url == /favicon.ico", async () => {
      const server = new Drash.Http.Server({
        resources: [HomeResource],
      });
      const request = members.mockRequest("/favicon.ico");
      const response = await server.handleHttpRequest(request);
      Rhum.asserts.assertEquals(200, response.status_code);
    });

    Rhum.testCase("GET", async () => {
      const server = new Drash.Http.Server({
        resources: [HomeResource],
      });
      let request = members.mockRequest("/");
      let response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        decoder.decode(response.body as ArrayBuffer),
        { body: "got" },
      );
    });

    Rhum.testCase("GET /:some_param", async () => {
      const server = new Drash.Http.Server({
        resources: [HomeResource],
      });
      let request = members.mockRequest("/w00t");
      let response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        decoder.decode(response.body as ArrayBuffer),
        { body: "w00t" },
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
      const request = members.mockRequest("/", "post", {
        headers: {
          "Content-Type": "application/json",
        },
        body: reader,
      });
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        decoder.decode(response.body as ArrayBuffer),
        { body: "hello" },
      );
    });

    Rhum.testCase("getPathParam() for :id", async () => {
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
      request = members.mockRequest("/users/1/");
      response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(members.responseBody(response), {
        user_id: "1",
      });
      request = members.mockRequest("/notes/1557");
      response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        decoder.decode(response.body as ArrayBuffer),
        { note_id: "1557" },
      );
      request = members.mockRequest("/notes/1557/");
      response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        decoder.decode(response.body as ArrayBuffer),
        { note_id: "1557" },
      );
    });

    Rhum.testCase("getHeaderParam()", async () => {
      const server = new Drash.Http.Server({
        resources: [GetHeaderParam],
      });
      const request = members.mockRequest("/", "get", {
        headers: {
          id: 12345,
        },
      });
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        decoder.decode(response.body as ArrayBuffer),
        { header_param: "12345" },
      );
    });

    Rhum.testCase("getUrlQueryParam()", async () => {
      const server = new Drash.Http.Server({
        resources: [GetUrlQueryParam],
      });
      const request = members.mockRequest("/?id=123459");
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        decoder.decode(response.body as ArrayBuffer),
        { query_param: "123459" },
      );
    });

    Rhum.testCase("response.redirect() with 301", async () => {
      const server = new Drash.Http.Server({
        resources: [NotesResource],
      });
      let request;
      let response;
      request = members.mockRequest("/notes/1234", "get", {
        server: server,
      });
      response = await server.handleHttpRequest(request);
      Rhum.asserts.assertEquals(response.status, 301);
      Rhum.asserts.assertEquals(
        response.headers!.get("location"),
        "/notes/1667",
      );
    });

    Rhum.testCase("response.redirect() with 302", async () => {
      const server = new Drash.Http.Server({
        resources: [NotesResource],
      });
      let request;
      let response;
      request = members.mockRequest("/notes/123", "get", {
        server: server,
      });
      response = await server.handleHttpRequest(request);
      Rhum.asserts.assertEquals(response.status, 302);
      Rhum.asserts.assertEquals(
        response.headers!.get("location"),
        "/notes/1557",
      );
    });

    Rhum.testCase(
      "Throws an error when the response was not returned in the resource",
      async () => {
        const server = new Drash.Http.Server({
          resources: [InvalidReturningOfResponseResource],
        });
        let request = members.mockRequest("/invalid/returning/of/response");
        let response = await server.handleHttpRequest(request);
        Rhum.asserts.assertEquals(response.status_code, 418);
        request = members.mockRequest("/invalid/returning/of/response", "POST");
        response = await server.handleHttpRequest(request);
        Rhum.asserts.assertEquals(response.status_code, 418);
      },
    );
  });

  Rhum.testSuite("handleHttpRequestError()", () => {
    Rhum.testCase("Returns the correct response", async () => {
      const request = members.mockRequest("/", "get");
      const server = new Drash.Http.Server({});
      const error = {
        code: 404,
        message: "Some error message",
      } as Drash.Exceptions.HttpException;
      const response = await server.handleHttpRequestError(request, error);
      Rhum.asserts.assertEquals(response.status, 404);
      Rhum.asserts.assertEquals(
        decoder.decode(response.body as ArrayBuffer),
        '"Some error message"',
      );
    });
  });

  Rhum.testSuite("handleHttpRequestForFavicon", () => {
    Rhum.testCase("Returns the correct response", async () => {
      const request = members.mockRequest("/favicon.ico", "get");
      const server = new Drash.Http.Server({});
      const response = await server.handleHttpRequestForFavicon(request);
      Rhum.asserts.assertEquals(response.body, new TextEncoder().encode(""));
      Rhum.asserts.assertEquals(response.status_code, 200);
      let expectedHeaders = new Headers();
      expectedHeaders.set("Content-Type", "image/x-icon");
      Rhum.asserts.assertEquals(response.headers, expectedHeaders);
    });
  });

  Rhum.testSuite("run()", () => {
    Rhum.testCase("Runs a server", async () => {
      class Resource extends Drash.Http.Resource {
        static paths = ["/"];
        public GET() {
          this.response.body = "Hello world!";
          return this.response;
        }
      }
      const server = new Drash.Http.Server({
        resources: [Resource],
      });
      await server.run({
        hostname: "localhost",
        port: 1667,
      });
      const res = await fetch("http://localhost:1667");
      const text = await res.text();
      await server.close();
      Rhum.asserts.assertEquals(res.status, 200);
      Rhum.asserts.assertEquals(text, '"Hello world!"');
    });
  });

  Rhum.testSuite("runTLS()", () => {
    // TODO(ebebbington) TLS doesn't work with fetch atm. See: https://github.com/denoland/deno/issues/2301
    //  and: https://github.com/denoland/deno/issues/1371. Might need to update the certs.
    // Rhum.testCase("Runs a server", async  () => {
    //   class Resource extends Drash.Http.Resource {
    //     static paths = ["/"];
    //     public GET() {
    //       this.response.body = "Hello world!";
    //       return this.response;
    //     }
    //   }
    //   const server = new Drash.Http.Server({
    //     resources: [Resource]
    //   });
    //   await server.runTLS({
    //     hostname: "localhost",
    //     port: 1667,
    //     certFile: "./tests/integration/app_3002_https/server.crt",
    //     keyFile: "./tests/integration/app_3002_https/server.key"
    //   });
    //   const res = await fetch("https://localhost:1667");
    //   const text = await res.text();
    //   await server.close();
    //   Rhum.asserts.assertEquals(res.status, 200);
    //   Rhum.asserts.assertEquals(text, "\"Hello world!\"")
    // });
  });

  Rhum.testSuite("close()", () => {
    Rhum.testCase("Closes the server", async () => {
      const server = new Drash.Http.Server({});
      await server.run({
        hostname: "localhost",
        port: 1667,
      });
      const denoServerExists: boolean = !!server.deno_server;
      Rhum.asserts.assert(denoServerExists);
      server.close();
      Rhum.asserts.assert(!server.deno_server);
    });
  });

  Rhum.testSuite("isValidResponse()", () => {
    Rhum.testCase("Should check that the response object is valid", () => {
      const server = new Drash.Http.Server({});
      const request = new Drash.Http.Request(members.mockRequest("/hello"));
      const isValidResponse = Reflect.get(server, "isValidResponse");
      let response: Drash.Http.Response = new Drash.Http.Response(
        request,
        {},
      );
      const resource = new HomeResource(
        request,
        response,
        server,
        ["/"],
        {},
      );
      //Simulate user not returning properly inside their resource method
      const possiblesInvalidResponse = [
        "hello",
        true,
        1,
        { name: "Ed" },
        ["hello"],
        null,
        undefined,
      ];
      possiblesInvalidResponse.forEach((invalidRes) => {
        Rhum.asserts.assertThrows(() => {
          isValidResponse(request, invalidRes, resource);
        });
      });
      const responseOutput: Drash.Interfaces.ResponseOutput = {
        body: new Uint8Array(1),
        headers: new Headers(),
        status: 69420,
        status_code: 418,
        send: undefined,
      };
      response = new Drash.Http.Response(
        request,
        {},
      );
      let isValid = isValidResponse(request, responseOutput, resource);
      Rhum.asserts.assertEquals(isValid, true);
      isValid = isValidResponse(request, response, resource);
      Rhum.asserts.assertEquals(isValid, true);
    });
  });
});

Rhum.run();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends Drash.Http.Resource {
  static paths = ["/", "/:some_param"];
  public GET() {
    const someParam = this.request.getPathParam("some_param");
    if (someParam) {
      this.response.body = { body: someParam };
      return this.response;
    }
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

class InvalidReturningOfResponseResource extends Drash.Http.Resource {
  static paths = ["/invalid/returning/of/response"];
  public GET() {
  }
  public POST() {
    return "hello";
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
