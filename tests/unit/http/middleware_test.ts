import { Rhum } from "../../deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("http/middleware_test.ts", () => {
  Rhum.testSuite("http/middleware_test.ts", () => {
    Rhum.testCase("before_request: missing CSRF token", async () => {
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

    Rhum.testCase("before_request: wrong CSRF token", async () => {
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

    Rhum.testCase("after_request: missing header", async () => {
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

    Rhum.testCase("after_request: wrong header", async () => {
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

    Rhum.testCase("after_request: pass", async () => {
      const server = new Drash.Http.Server({
        middleware: {
          after_request: [AfterRequest],
        },
        resources: [ResourceWithMiddlewareHooked],
      });
      const request = members.mockRequest("/", "get", {
        headers: {
          send_response: "yes do it",
        },
      });
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(members.responseBody(response), "got");
    });

    Rhum.testCase("before_request: missing header", async () => {
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

    Rhum.testCase("before_request: wrong header", async () => {
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

    Rhum.testCase("before_request: pass", async () => {
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

    Rhum.testCase("before_request: static path asset", async () => {
      let server = new Drash.Http.Server({
        directory: ".",
        static_paths: ["/assets"],
        middleware: {
          before_request: [BeforeRequestStaticPathAsset],
        },
      });
      const request = members.mockRequest("/assets/test.js", "get");
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        members.responseBody(response),
        "Hello, I'm a static path asset before request middleware.",
      );
    });

    Rhum.testCase("after_request: static path asset", async () => {
      let server = new Drash.Http.Server({
        directory: ".",
        static_paths: ["/assets"],
        middleware: {
          after_request: [AfterRequestStaticPathAsset],
        },
      });
      const request = members.mockRequest("/assets/test.js", "get");
      const response = await server.handleHttpRequest(request);
      members.assertResponseJsonEquals(
        members.responseBody(response),
        "this static path asset's contents got changed",
      );
    });
  });
});

Rhum.run();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

interface IUser {
  name: string;
}

class ResourceWithMiddleware extends Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  public GET() {
    const param = this.request.getPathParam("id");
    if (param) {
      this.response.body = this.users.get(parseInt(param));
    }
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

function BeforeRequest(req: Drash.Http.Request) {
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
}

function AfterRequest(req: Drash.Http.Request, res: Drash.Http.Response) {
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

function VerifyCsrfToken(req: Drash.Http.Request) {
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

function BeforeRequestStaticPathAsset(req: Drash.Http.Request) {
  throw new Drash.Exceptions.HttpException(
    418,
    "Hello, I'm a static path asset before request middleware.",
  );
}

function AfterRequestStaticPathAsset(
  req: Drash.Http.Request,
  res?: Drash.Http.Response,
) {
  if (res) {
    res.body = "this static path asset's contents got changed";
  }
}
