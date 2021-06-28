import { Drash, Rhum, TestHelpers } from "../../../../deps.ts";
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
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "got",
      );
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
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "got",
      );
    });
  });

  Rhum.testSuite("@decorator test | ResourceWithMiddlewareBeforeClass", () => {
    Rhum.testCase("header not specified", async () => {
      const server = new Drash.Server({
        resources: [ResourceWithMiddlewareBeforeClass],
      });
      const request = TestHelpers.mockRequest("/users/1");
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        "'header' not specified.",
      );
    });
    Rhum.testCase("valid", async () => {
      const server = new Drash.Server({
        resources: [ResourceWithMiddlewareBeforeClass],
      });
      const request = TestHelpers.mockRequest("/users/1", "get", {
        headers: {
          csrf_token: "all your base",
        },
      });
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        { name: "Thor" },
      );
    });
  });

  Rhum.testSuite(
    "@decorate test | ResourceWithMultipleMiddlewareBeforeClass",
    () => {
      Rhum.testCase("correct header, custom response and value", async () => {
        const server = new Drash.Server({
          resources: [ResourceWithMultipleMiddlewareBeforeClass],
        });
        const request = TestHelpers.mockRequest("/users/1", "get", {
          headers: {
            csrf_token: "all your base",
          },
        });
        const response = await server.handleHttpRequest(request);
        TestHelpers.assertResponseJsonEquals(
          TestHelpers.responseBody(response),
          { name: "Thor" },
        );
        Rhum.asserts.assertEquals(response.headers!.get("MYCUSTOM"), "hey");
      });
    },
  );

  Rhum.testSuite(
    "@decorator test | ResourceWithMultipleMiddlewareAfterClass",
    () => {
      Rhum.testCase("response is html, custom header and value", async () => {
        const server = new Drash.Server({
          resources: [ResourceWithMultipleMiddlewareAfterClass],
        });
        const request = TestHelpers.mockRequest("/users/1", "get", {
          headers: {
            csrf_token: "all your base",
          },
        });
        const response = await server.handleHttpRequest(request);
        Rhum.asserts.assertEquals(
          TestHelpers.responseBody(response),
          "<h1>hey</h1>",
        );
        Rhum.asserts.assertEquals(
          response.headers!.get("Content-Type"),
          "text/html",
        );
        Rhum.asserts.assertEquals(response.headers!.get("MYCUSTOM"), "hey");
      });
    },
  );

  Rhum.testSuite("@decorator test | ResourceWithMiddlewareClass", () => {
    Rhum.testCase("custom header and swap to html", async () => {
      const server = new Drash.Server({
        resources: [ResourceWithMiddlewareClass],
      });
      const request = TestHelpers.mockRequest("/users/1", "get", {
        headers: {
          csrf_token: "all your base",
        },
      });
      const response = await server.handleHttpRequest(request);
      Rhum.asserts.assertEquals(
        TestHelpers.responseBody(response),
        "<h1>hey</h1>",
      );
      Rhum.asserts.assertEquals(
        response.headers!.get("Content-Type"),
        "text/html",
      );
      Rhum.asserts.assertEquals(response.headers!.get("MYCUSTOM"), "hey");
    });
  });

  Rhum.testSuite("@decorator test | ResourceWithMiddlewareBeforeMethod", () => {
    Rhum.testCase("custom header", async () => {
      const server = new Drash.Server({
        resources: [ResourceWithMiddlewareBeforeMethod],
      });
      const request = TestHelpers.mockRequest("/users/1", "get", {
        headers: {
          csrf_token: "all your base",
        },
      });
      const response = await server.handleHttpRequest(request);
      TestHelpers.assertResponseJsonEquals(
        TestHelpers.responseBody(response),
        { name: "Thor" },
      );
    });
  });

  Rhum.testSuite(
    "@decorator test | ResourceWithMultipleMiddlewareBeforeMethod",
    () => {
      Rhum.testCase("custom header", async () => {
        const server = new Drash.Server({
          resources: [ResourceWithMultipleMiddlewareBeforeMethod],
        });
        const request = TestHelpers.mockRequest("/users/1", "get", {
          headers: {
            csrf_token: "all your base",
          },
        });
        const response = await server.handleHttpRequest(request);
        TestHelpers.assertResponseJsonEquals(
          TestHelpers.responseBody(response),
          { name: "Thor" },
        );
        Rhum.asserts.assertEquals(response.headers!.get("MYCUSTOM"), "hey");
      });
    },
  );

  Rhum.testSuite("@decorator test | ResourceWithMiddlewareAfterMethod", () => {
    Rhum.testCase("swap to html", async () => {
      const server = new Drash.Server({
        resources: [ResourceWithMiddlewareAfterMethod],
      });
      const request = TestHelpers.mockRequest("/users/1", "get", {
        headers: {
          csrf_token: "all your base",
        },
      });
      const response = await server.handleHttpRequest(request);
      Rhum.asserts.assertEquals(
        TestHelpers.responseBody(response),
        "<h1>hey</h1>",
      );
      Rhum.asserts.assertEquals(
        response.headers!.get("Content-Type"),
        "text/html",
      );
    });
  });

  Rhum.testSuite(
    "@decorator test | ResourceWithMultipleMiddlewareAfterMethod",
    () => {
      Rhum.testCase("custom header and swap to html", async () => {
        const server = new Drash.Server({
          resources: [ResourceWithMultipleMiddlewareAfterMethod],
        });
        const request = TestHelpers.mockRequest("/users/1", "get", {
          headers: {
            csrf_token: "all your base",
          },
        });
        const response = await server.handleHttpRequest(request);
        Rhum.asserts.assertEquals(
          TestHelpers.responseBody(response),
          "<h1>hey</h1>",
        );
        Rhum.asserts.assertEquals(
          response.headers!.get("Content-Type"),
          "text/html",
        );
        Rhum.asserts.assertEquals(response.headers!.get("MYCUSTOM"), "hey");
      });
    },
  );
});

Rhum.run();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA - MIDDLEWARE /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function BeforeRequest(req: Drash.Request) {
  if (!req.getHeaderParam("before")) {
    throw new Drash.Errors.HttpError(
      400,
      "Missing header, guy.",
    );
  }
  if (req.getHeaderParam("before") != "yesss") {
    throw new Drash.Errors.HttpError(
      400,
      "Ha... try again. Close though.",
    );
  }
}

function AfterRequest(req: Drash.Request, res: Drash.Response) {
  if (!req.getHeaderParam("send_response")) {
    throw new Drash.Errors.HttpError(
      400,
      "Missing header, guy.",
    );
  }
  if (req.getHeaderParam("send_response") != "yes do it") {
    throw new Drash.Errors.HttpError(
      400,
      "Ha... try again. Close though.",
    );
  }
}

function VerifyCsrfToken(req: Drash.Request) {
  if (!req.getHeaderParam("csrf_token")) {
    throw new Drash.Errors.HttpError(
      400,
      "No CSRF token, dude.",
    );
  }
  if (req.getHeaderParam("csrf_token") != "all your base") {
    throw new Drash.Errors.HttpError(
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

function DecoratorCustomHeader(
  request: Drash.Request,
  response: Drash.Response,
) {
  if (request.getHeaderParam("csrf_token") == null) {
    throw new Drash.Errors.HttpError(
      400,
      "'header' not specified.",
    );
  }
}

function DecoratorSwapResponseToHtml(
  request: Drash.Request,
  response: Drash.Response,
) {
  response.headers.set("Content-Type", "text/html");
  response.body = "<h1>hey</h1>";
}

function DecoratorResponseCustomHeaderAdded(
  request: Drash.Request,
  response: Drash.Response,
) {
  response.headers.set("MYCUSTOM", "hey");
}////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA - RESOURCES //////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA - RESOURCES WITH DECORATOR MIDDLEWARE ////////////////////
////////////////////////////////////////////////////////////////////////////////

@Drash.Middleware({ before_request: [DecoratorCustomHeader] })
class ResourceWithMiddlewareBeforeClass extends Drash.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  public GET() {
    const param = this.request.getPathParam("id");
    if (param) {
      this.response.body = this.users.get(
        parseInt(param),
      );
    }
    return this.response;
  }
}

@Drash.Middleware(
  {
    before_request: [DecoratorResponseCustomHeaderAdded, DecoratorCustomHeader],
  },
)
class ResourceWithMultipleMiddlewareBeforeClass extends Drash.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  public GET() {
    const param = this.request.getPathParam("id");
    if (param) {
      this.response.body = this.users.get(
        parseInt(param),
      );
    }
    return this.response;
  }
}

@Drash.Middleware(
  {
    after_request: [
      DecoratorSwapResponseToHtml,
      DecoratorResponseCustomHeaderAdded,
    ],
  },
)
class ResourceWithMultipleMiddlewareAfterClass extends Drash.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  public GET() {
    return this.response;
  }
}

@Drash.Middleware(
  {
    before_request: [DecoratorSwapResponseToHtml],
    after_request: [DecoratorResponseCustomHeaderAdded],
  },
)
class ResourceWithMiddlewareClass extends Drash.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  public GET() {
    return this.response;
  }
}

class ResourceWithMiddlewareBeforeMethod extends Drash.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  @Drash.Middleware({ before_request: [DecoratorCustomHeader] })
  public GET() {
    const param = this.request.getPathParam("id");
    if (param) {
      this.response.body = this.users.get(
        parseInt(param),
      );
    }
    return this.response;
  }
}

class ResourceWithMiddlewareAfterMethod extends Drash.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  @Drash.Middleware({ after_request: [DecoratorSwapResponseToHtml] })
  public GET() {
    return this.response;
  }
}

class ResourceWithMultipleMiddlewareBeforeMethod extends Drash.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  @Drash.Middleware(
    {
      before_request: [
        DecoratorResponseCustomHeaderAdded,
        DecoratorCustomHeader,
      ],
    },
  )
  public GET() {
    const param = this.request.getPathParam("id");
    if (param) {
      this.response.body = this.users.get(
        parseInt(param),
      );
    }
    return this.response;
  }
}

class ResourceWithMultipleMiddlewareAfterMethod extends Drash.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users = new Map<number, IUser>([
    [1, { name: "Thor" }],
    [2, { name: "Hulk" }],
  ]);
  @Drash.Middleware(
    {
      after_request: [
        DecoratorSwapResponseToHtml,
        DecoratorResponseCustomHeaderAdded,
      ],
    },
  )
  public GET() {
    return this.response;
  }
}
