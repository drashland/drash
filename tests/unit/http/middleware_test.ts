import { Drash, Rhum, TestHelpers } from "../../deps.ts";
const decoder = new TextDecoder();

Rhum.testPlan("http/middleware_test.ts", () => {
  Rhum.testSuite("http/middleware_test.ts", () => {
    Rhum.testCase("after_resource: can change response.render", async () => {
      const server = new Drash.Server({
        middleware: {
          after_resource: [TemplateEngine],
        },
        resources: [ResourceWithTemplateEngine],
      });
      const request = TestHelpers.mockRequest("/template-engine");
      const response = await server.handleHttpRequest(request);
      Rhum.asserts.assertEquals(
        decoder.decode(response.body as ArrayBuffer),
        "RENDERRRRRRd",
      );
    });

    Rhum.testCase("compile_time", async () => {
      let server = new Drash.Server({
        middleware: {
          compile_time: [
            CompileTimeMiddleware(),
          ],
        },
        resources: [
          ResourceWithCompileTimeMiddleware,
        ],
      });
      const request = TestHelpers.mockRequest("/hello");
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "WE OUT HERE",
      );
    });

    Rhum.testCase("before_request: missing CSRF token", async () => {
      const server = new Drash.Server({
        middleware: {
          before_request: [VerifyCsrfToken],
        },
        resources: [ResourceWithMiddleware],
      });
      const request = TestHelpers.mockRequest("/users/1");
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "No CSRF token, dude.",
      );
    });

    Rhum.testCase("before_request: wrong CSRF token", async () => {
      const server = new Drash.Server({
        middleware: {
          before_request: [VerifyCsrfToken],
        },
        resources: [ResourceWithMiddleware],
      });
      const request = TestHelpers.mockRequest("/users/1", "get", {
        headers: {
          csrf_token: "hehe",
        },
      });
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "Wrong CSRF token, dude.",
      );
    });

    Rhum.testCase("after_request: missing header", async () => {
      const server = new Drash.Server({
        middleware: {
          after_request: [AfterRequest],
        },
        resources: [ResourceWithMiddlewareHooked],
      });
      const request = TestHelpers.mockRequest("/");
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "Missing header, guy.",
      );
    });

    Rhum.testCase("after_request: wrong header", async () => {
      let server = new Drash.Server({
        middleware: {
          after_request: [AfterRequest],
        },
        resources: [ResourceWithMiddlewareHooked],
      });
      const request = TestHelpers.mockRequest("/", "get", {
        headers: {
          send_response: "yes please",
        },
      });
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "Ha... try again. Close though.",
      );
    });

    Rhum.testCase("after_request: pass", async () => {
      const server = new Drash.Server({
        middleware: {
          after_request: [AfterRequest],
        },
        resources: [ResourceWithMiddlewareHooked],
      });
      const request = TestHelpers.mockRequest("/", "get", {
        headers: {
          send_response: "yes do it",
        },
      });
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(TestHelpers.responseBody(response), "got");
    });

    Rhum.testCase("before_request: missing header", async () => {
      const server = new Drash.Server({
        middleware: {
          before_request: [BeforeRequest],
        },
        resources: [ResourceWithMiddlewareHooked],
      });
      const request = TestHelpers.mockRequest("/");
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "Missing header, guy.",
      );
    });

    Rhum.testCase("before_request: wrong header", async () => {
      const server = new Drash.Server({
        middleware: {
          before_request: [BeforeRequest],
        },
        resources: [ResourceWithMiddlewareHooked],
      });
      const request = TestHelpers.mockRequest("/", "get", {
        headers: {
          before: "yes",
        },
      });
      const response = await server.handleHttpRequest(request);

      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "Ha... try again. Close though.",
      );
    });

    Rhum.testCase("before_request: pass", async () => {
      let server = new Drash.Server({
        middleware: {
          before_request: [BeforeRequest],
        },
        resources: [ResourceWithMiddlewareHooked],
      });
      const request = TestHelpers.mockRequest("/", "get", {
        headers: {
          before: "yesss",
        },
      });
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(TestHelpers.responseBody(response), "got");
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

class ResourceWithTemplateEngine extends Drash.Resource {
  static paths = ["/template-engine"];
  public GET() {
    this.response.body = this.response.render("hello");
    return this.response;
  }
}

class ResourceWithMiddleware extends Drash.Resource {
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

class ResourceWithMiddlewareHooked extends Drash.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

class ResourceWithCompileTimeMiddleware extends Drash.Resource {
  static paths = ["/hello"];
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

function BeforeRequest(req: Drash.Request) {
  if (!req.getHeaderParam("before")) {
    throw new Drash.HttpError(
      400,
      "Missing header, guy.",
    );
  }
  if (req.getHeaderParam("before") != "yesss") {
    throw new Drash.HttpError(
      400,
      "Ha... try again. Close though.",
    );
  }
}

function AfterRequest(req: Drash.Request, res: Drash.Response) {
  if (!req.getHeaderParam("send_response")) {
    throw new Drash.HttpError(
      400,
      "Missing header, guy.",
    );
  }
  if (req.getHeaderParam("send_response") != "yes do it") {
    throw new Drash.HttpError(
      400,
      "Ha... try again. Close though.",
    );
  }
}

function VerifyCsrfToken(req: Drash.Request) {
  if (!req.getHeaderParam("csrf_token")) {
    throw new Drash.HttpError(
      400,
      "No CSRF token, dude.",
    );
  }
  if (req.getHeaderParam("csrf_token") != "all your base") {
    throw new Drash.HttpError(
      400,
      "Wrong CSRF token, dude.",
    );
  }
}

function TemplateEngine(
  req: Drash.Request,
  res: Drash.Response,
) {
  res.render = (...args: string[]): string | boolean => {
    res.headers.set("Content-Type", "text/html");
    return "RENDERRRRRRd";
  };
}

function CompileTimeMiddleware() {
  const compiledStuff: string[] = [];

  async function compile(): Promise<void> {
    compiledStuff.push("WE OUT HERE");
  }

  async function run(
    request: Drash.Request,
    response: Drash.Response,
  ): Promise<void> {
    if (request.url == "/hello") {
      response.body = compiledStuff[0];
    }
  }
  return {
    compile,
    run,
  };
}
