import { Drash, Rhum, TestHelpers } from "../../deps.ts";

Rhum.testPlan("decorators/middleware_test.ts", () => {
  Rhum.testSuite("ResourceWithMiddlewareBeforeClass", () => {
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

  Rhum.testSuite("ResourceWithMultipleMiddlewareBeforeClass", () => {
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
  });

  Rhum.testSuite("ResourceWithMultipleMiddlewareAfterClass", () => {
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
      Rhum.asserts.assertEquals(TestHelpers.responseBody(response), "<h1>hey</h1>");
      Rhum.asserts.assertEquals(
        response.headers!.get("Content-Type"),
        "text/html",
      );
      Rhum.asserts.assertEquals(response.headers!.get("MYCUSTOM"), "hey");
    });
  });

  Rhum.testSuite("ResourceWithMiddlewareClass", () => {
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
      Rhum.asserts.assertEquals(TestHelpers.responseBody(response), "<h1>hey</h1>");
      Rhum.asserts.assertEquals(
        response.headers!.get("Content-Type"),
        "text/html",
      );
      Rhum.asserts.assertEquals(response.headers!.get("MYCUSTOM"), "hey");
    });
  });

  Rhum.testSuite("ResourceWithMiddlewareBeforeMethod", () => {
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

  Rhum.testSuite("ResourceWithMultipleMiddlewareBeforeMethod", () => {
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
  });

  Rhum.testSuite("ResourceWithMiddlewareAfterMethod", () => {
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
      Rhum.asserts.assertEquals(TestHelpers.responseBody(response), "<h1>hey</h1>");
      Rhum.asserts.assertEquals(
        response.headers!.get("Content-Type"),
        "text/html",
      );
    });
  });

  Rhum.testSuite("ResourceWithMultipleMiddlewareAfterMethod", () => {
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
      Rhum.asserts.assertEquals(TestHelpers.responseBody(response), "<h1>hey</h1>");
      Rhum.asserts.assertEquals(
        response.headers!.get("Content-Type"),
        "text/html",
      );
      Rhum.asserts.assertEquals(response.headers!.get("MYCUSTOM"), "hey");
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

const CustomHeader = function CustomHeader(
  request: Drash.Request,
  response: Drash.Response,
) {
  if (request.getHeaderParam("csrf_token") == null) {
    throw new Drash.HttpError(
      400,
      "'header' not specified.",
    );
  }
}

const SwapResponseToHtml = function SwapResponseToHtml(
  request: Drash.Request,
  response: Drash.Response,
) {
  response.headers.set("Content-Type", "text/html");
  response.body = "<h1>hey</h1>";
}

const ResponseCustomHeaderAdded = function ResponseCustomHeaderAdded(
  request: Drash.Request,
  response: Drash.Response,
) {
  response.headers.set("MYCUSTOM", "hey");
}

@Drash.Middleware({ before_request: [CustomHeader] })
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
  { before_request: [ResponseCustomHeaderAdded, CustomHeader] },
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
  { after_request: [SwapResponseToHtml, ResponseCustomHeaderAdded] },
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
    before_request: [SwapResponseToHtml],
    after_request: [ResponseCustomHeaderAdded],
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
  @Drash.Middleware({ before_request: [CustomHeader] })
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
  @Drash.Middleware({ after_request: [SwapResponseToHtml] })
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
    { before_request: [ResponseCustomHeaderAdded, CustomHeader] },
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
    { after_request: [SwapResponseToHtml, ResponseCustomHeaderAdded] },
  )
  public GET() {
    return this.response;
  }
}
