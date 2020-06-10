import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

members.testSuite("http/middleware_test.ts", () => {

  members.test("before_request: missing CSRF token", async () => {
    const server = new Drash.Http.Server({
      middleware: {
        before_request: [VerifyCsrfToken],
      },
      resources: [ResourceWithMiddleware],
    });
    const request = members.mockRequest("/users/1");
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(
      members.responseBody(response),
      "No CSRF token, dude.",
    );
  });

  members.test("before_request: wrong CSRF token", async () => {
    const server = new Drash.Http.Server({
      middleware: {
        before_request: [VerifyCsrfToken],
      },
      resources: [ResourceWithMiddleware],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "hehe",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(
      members.responseBody(response),
      "Wrong CSRF token, dude.",
    );
  });

  members.test("before_response: missing header", async () => {
    const server = new Drash.Http.Server({
      middleware: {
        after_request: [AfterRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });
    const request = members.mockRequest("/");
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(
      members.responseBody(response),
      "Missing header, guy.",
    );
  });

  members.test("after_request: wrong header", async () => {
    let server = new Drash.Http.Server({
      middleware: {
        after_request: [AfterRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });
    const request = members.mockRequest("/", "get", {
      headers: {
        send_response: "yes please",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(
      members.responseBody(response),
      "Ha... try again. Close though.",
    );
  });

  members.test("after_request: pass", async () => {
    const server = new Drash.Http.Server({
      middleware: {
        after_request: [AfterRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });
    const request = members.mockRequest("/", "get", {
      headers: {
        send_response: "yes do it",
      }
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(members.responseBody(response), "got");
  });

  members.test("before_request: missing header", async () => {
    const server = new Drash.Http.Server({
      middleware: {
        before_request: [BeforeRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });
    const request = members.mockRequest("/"); 
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(
      members.responseBody(response),
      "Missing header, guy.",
    );
  });

  members.test("before_request: wrong header", async () => {
    const server = new Drash.Http.Server({
      middleware: {
        before_request: [BeforeRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });
    const request = members.mockRequest("/", "get", {
      headers: {
        before: "yes",
      },
    });
    const response = await server.handleHttpRequest(request);

    members.assertResponseJsonEquals(
      members.responseBody(response),
      "Ha... try again. Close though.",
    );
  });

  members.test("before_request: pass", async () => {
    let server = new Drash.Http.Server({
      middleware: {
        before_request: [BeforeRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });
    const request = members.mockRequest("/", "get", {
      headers: {
        before: "yesss",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(members.responseBody(response), "got");
  });

});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class ResourceWithMiddleware extends Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users: any = {
    1: {
      name: "Thor",
    },
    2: {
      name: "Hulk",
    },
  };
  public GET() {
    this.response.body = this.users[this.request.getPathParam("id")];
    return this.response;
  }
}

class ResourceWithMiddlewareHooked extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

function BeforeRequest(req: any) {
  if (!req.getHeaderParam("before")) {
    throw new Drash.Exceptions.HttpException(
      400,
      "Missing header, guy.",
    );
  }
  if (req.getHeaderParam("before") != "yesss") {
    throw new Drash.Exceptions.HttpException(
      400,
      "Ha... try again. Close though.",
    );
  }

  req.hello = "changed_before_request";
}

function AfterRequest(req: any, res: Drash.Http.Response) {
  if (!req.getHeaderParam("send_response")) {
    throw new Drash.Exceptions.HttpException(
      400,
      "Missing header, guy.",
    );
  }
  if (req.getHeaderParam("send_response") != "yes do it") {
    throw new Drash.Exceptions.HttpException(
      400,
      "Ha... try again. Close though.",
    );
  }
}

function VerifyCsrfToken(req: any) {
  if (!req.getHeaderParam("csrf_token")) {
    throw new Drash.Exceptions.HttpException(
      400,
      "No CSRF token, dude.",
    );
  }
  if (req.getHeaderParam("csrf_token") != "all your base") {
    throw new Drash.Exceptions.HttpException(
      400,
      "Wrong CSRF token, dude.",
    );
  }
}
