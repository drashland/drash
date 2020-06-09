import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

members.testSuite("middleware_test.ts", () => {

  members.test("ResourceWithMiddlewareBeforeClass: header not specified", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMiddlewareBeforeClass],
    });
    const request = members.mockRequest("/users/1");
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(await members.responseBody(response), "'header' not specified.");
  });

  members.test("ResourceWithMiddlewareBeforeClass: valid", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMiddlewareBeforeClass],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "all your base"
      }
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(await members.responseBody(response), { name: "Thor" });
  });

  members.test("ResourceWithMultipleMiddlewareBeforeClass: correct header, custom response and value", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMultipleMiddlewareBeforeClass],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "all your base"
      }
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(await members.responseBody(response), { name: "Thor" });
    members.assertEquals(response.headers.get("MYCUSTOM"), "hey");
  });

  members.test("ResourceWithMultipleMiddlewareAfterClass: response is html, custom header and value", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMultipleMiddlewareAfterClass],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "all your base",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertEquals(await members.responseBody(response), "<h1>hey</h1>");
    members.assertEquals(response.headers.get("Content-Type"), "text/html");
    members.assertEquals(response.headers.get("MYCUSTOM"), "hey");
  });

  members.test("ResourceWithMiddlewareClass: custom header and swap to html", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMiddlewareClass],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "all your base",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertEquals(await members.responseBody(response), "<h1>hey</h1>");
    members.assertEquals(response.headers.get("Content-Type"), "text/html");
    members.assertEquals(response.headers.get("MYCUSTOM"), "hey");
  });

  members.test("ResourceWithMiddlewareBeforeMethod: custom header", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMiddlewareBeforeMethod],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "all your base",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(await members.responseBody(response), { name: "Thor" });
  });

  members.test("ResourceWithMultipleMiddlewareBeforeMethod: custom header", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMultipleMiddlewareBeforeMethod],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "all your base",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertResponseJsonEquals(await members.responseBody(response), { name: "Thor" });
    members.assertEquals(response.headers.get("MYCUSTOM"), "hey");
  });

  members.test("ResourceWithMiddlewareAfterMethod: swap to html", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMiddlewareAfterMethod],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "all your base",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertEquals(await members.responseBody(response), "<h1>hey</h1>");
    members.assertEquals(response.headers.get("Content-Type"), "text/html");
  });

  members.test("ResourceWithMultipleMiddlewareAfterMethod: custom header and swap to html", async () => {
    const server = new Drash.Http.Server({
      resources: [ResourceWithMultipleMiddlewareAfterMethod],
    });
    const request = members.mockRequest("/users/1", "get", {
      headers: {
        csrf_token: "all your base",
      },
    });
    const response = await server.handleHttpRequest(request);
    members.assertEquals(await members.responseBody(response), "<h1>hey</h1>");
    members.assertEquals(response.headers.get("Content-Type"), "text/html");
    members.assertEquals(response.headers.get("MYCUSTOM"), "hey");
  });

});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function CustomHeader(
  request: any,
  response: Drash.Http.Response,
) {
  if (request.getHeaderParam("csrf_token") == null) {
    throw new Drash.Exceptions.HttpMiddlewareException(
      400,
      "'header' not specified.",
    );
  }
}
function SwapResponseToHtml(
  request: any,
  response: Drash.Http.Response,
) {
  response.headers.set("Content-Type", "text/html");
  response.body = "<h1>hey</h1>";
}
function ResponseCustomHeaderAdded(
  request: any,
  response: Drash.Http.Response,
) {
  response.headers.set("MYCUSTOM", "hey");
}

@Drash.Http.Middleware({ before_request: [CustomHeader] })
class ResourceWithMiddlewareBeforeClass extends Drash.Http.Resource {
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

@Drash.Http.Middleware(
  { before_request: [ResponseCustomHeaderAdded, CustomHeader] },
)
class ResourceWithMultipleMiddlewareBeforeClass
  extends Drash.Http.Resource {
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

@Drash.Http.Middleware(
  { after_request: [SwapResponseToHtml, ResponseCustomHeaderAdded] },
)
class ResourceWithMultipleMiddlewareAfterClass
  extends Drash.Http.Resource {
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
    return this.response;
  }
}

@Drash.Http.Middleware(
  {
    before_request: [SwapResponseToHtml],
    after_request: [ResponseCustomHeaderAdded],
  },
)
class ResourceWithMiddlewareClass extends Drash.Http.Resource {
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
    return this.response;
  }
}

class ResourceWithMiddlewareBeforeMethod extends Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users: any = {
    1: {
      name: "Thor",
    },
    2: {
      name: "Hulk",
    },
  };
  @Drash.Http.Middleware({ before_request: [CustomHeader] })
  public GET() {
    this.response.body = this.users[this.request.getPathParam("id")];
    return this.response;
  }
}

class ResourceWithMiddlewareAfterMethod extends Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users: any = {
    1: {
      name: "Thor",
    },
    2: {
      name: "Hulk",
    },
  };
  @Drash.Http.Middleware({ after_request: [SwapResponseToHtml] })
  public GET() {
    return this.response;
  }
}

class ResourceWithMultipleMiddlewareBeforeMethod
  extends Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users: any = {
    1: {
      name: "Thor",
    },
    2: {
      name: "Hulk",
    },
  };
  @Drash.Http.Middleware(
    { before_request: [ResponseCustomHeaderAdded, CustomHeader] },
  )
  public GET() {
    this.response.body = this.users[this.request.getPathParam("id")];
    return this.response;
  }
}

class ResourceWithMultipleMiddlewareAfterMethod
  extends Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  public users: any = {
    1: {
      name: "Thor",
    },
    2: {
      name: "Hulk",
    },
  };
  @Drash.Http.Middleware(
    { after_request: [SwapResponseToHtml, ResponseCustomHeaderAdded] },
  )
  public GET() {
    return this.response;
  }
}
