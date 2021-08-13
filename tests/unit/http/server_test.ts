import { Drash, Rhum, TestHelpers } from "../../deps.ts";
const encoder = new TextEncoder();
const decoder = new TextDecoder();
import { Server } from "../../../src/http/server.ts"
import { assertThrowsAsync } from "../../deps.ts"

Rhum.testPlan("http/server_test.ts", () => {
  Rhum.testSuite("constructor()", () => {
    Rhum.testCase("Sets properties on the class correctly", () => {
      const server = new Server({
        port: 1234,
      })
      Rhum.asserts.assertEquals(server.options, {
        // TODO
      })
    })
  })

  Rhum.testSuite("address", () => {
    Rhum.testCase("Should correctly format the address", () => {
      const server1 = new Server({ protocol: "https", hostname: "hosty" ,port: 1234 })
      const server2 = new Server({ port: 1234 })
      Rhum.asserts.assertEquals(server1.address, "https://hosty:1234")
      Rhum.asserts.assertEquals(server2.address, "http://localhost:1234")
    })
  })

  Rhum.testSuite("close()", () => {
    Rhum.testCase("Closes the server", async () => {
      const server = new Server({ port: 1234 });
      await server.runHttp();
      await Deno.connect({
        hostname: server.options.hostname,
        port: server.options.port
      })
      server.close();
      assertThrowsAsync(async () => {await Deno.connect({
        hostname: server.options.hostname,
        port: server.options.port
      })})
    });
  });

  Rhum.testSuite("run()", () => {
    Rhum.testCase("TODO", async () => {
      
    })
  })
});

Rhum.run();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends Drash.Resource {
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

class UsersResource extends Drash.Resource {
  static paths = ["/users/:id"];
  public GET() {
    this.response.body = { user_id: this.request.getPathParam("id") };
    return this.response;
  }
}

class NotesResource extends Drash.Resource {
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

class InvalidReturningOfResponseResource extends Drash.Resource {
  static paths = ["/invalid/returning/of/response"];
  public GET() {
  }
  public POST() {
    return "hello";
  }
}

class GetHeaderParam extends Drash.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = { header_param: this.request.getHeaderParam("id") };
    return this.response;
  }
}

class GetUrlQueryParam extends Drash.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = { query_param: this.request.getUrlQueryParam("id") };
    return this.response;
  }
}
