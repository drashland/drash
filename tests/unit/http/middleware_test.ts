import members from "../../members.ts";

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server/resource: missing CSRF token", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [VerifyCsrfToken]
      },
      resource_level: [UserIsAdmin]
    },
    resources: [ResourceWithMiddleware]
  });

  server.run({
    hostname: "localhost",
    port: 1557
  });

  let response = await members.fetch.get("http://localhost:1557/users/1");

  members.assert.responseJsonEquals(
    await response.text(),
    "No CSRF token, dude."
  );

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server/resource: wrong CSRF token", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [VerifyCsrfToken],
      },
      resource_level: [UserIsAdmin],
    },
    resources: [ResourceWithMiddleware],
  });

  server.run({
    hostname: "localhost",
    port: 1668
  });

  let response = await members.fetch.get("http://localhost:1668/users/1", {
    headers: {
      csrf_token: "hehe",
    },
  });

  members.assert.responseJsonEquals(
    await response.text(),
    "Wrong CSRF token, dude.",
  );

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server/resource: user is not an admin", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [VerifyCsrfToken],
      },
      resource_level: [UserIsAdmin],
    },
    resources: [ResourceWithMiddleware],
  });

  server.run({
    hostname: "localhost",
    port: 1111
  });

  let response = await members.fetch.get("http://localhost:1111/users/1", {
    headers: {
      csrf_token: "all your base",
      user_id: 123,
    },
  });

  members.assert.responseJsonEquals(
    await response.text(),
    "'user_id' unknown.",
  );

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server/resource: pass", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [VerifyCsrfToken],
      },
      resource_level: [UserIsAdmin],
    },
    resources: [ResourceWithMiddleware],
  });

  server.run({
    hostname: "localhost",
    port: 1222
  });

  let response = await members.fetch.get("http://localhost:1222/users/1", {
    headers: {
      csrf_token: "all your base",
      user_id: 999,
    },
  });

  members.assert.responseJsonEquals(await response.text(), { name: "Thor" });

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server/resource: middleware not found", async () => {
  let server = new members.MockServer({
    middleware: {
      resource_level: [UserIsAdmin],
    },
    resources: [ResourceWithMiddlewareNotFound],
  });

  server.run({
    hostname: "localhost",
    port: 1337
  });

  let response = await members.fetch.get("http://localhost:1337/users/1");

  members.assert.responseJsonEquals(await response.text(), "I'm a teapot");

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server before_response: missing header", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        after_request: [AfterRequest],
      },
    },
    resources: [ResourceWithMiddlewareHooked],
  });

  server.run({
    hostname: "localhost",
    port: 1777
  });

  let response = await members.fetch.get("http://localhost:1777/");

  members.assert.responseJsonEquals(
    await response.text(),
    "Missing header, guy.",
  );

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server before_response: wrong header", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        after_request: [AfterRequest],
      },
    },
    resources: [ResourceWithMiddlewareHooked],
  });

  server.run({
    hostname: "localhost",
    port: 3000
  });

  let response = await members.fetch.get("http://localhost:3000/", {
    headers: {
      send_response: "yes please",
    },
  });

  members.assert.responseJsonEquals(
    await response.text(),
    "Ha... try again. Close though.",
  );

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server before_response: pass", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        after_request: [AfterRequest],
      },
    },
    resources: [ResourceWithMiddlewareHooked],
  });


  server.run({
    hostname: "localhost",
    port: 4000
  });
  let response = await members.fetch.get("http://localhost:4000/", {
    headers: {
      send_response: "yes do it",
    },
  });

  members.assert.responseJsonEquals(await response.text(), "got");

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server before_request: missing header", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [BeforeRequest],
      },
    },
    resources: [ResourceWithMiddlewareHooked],
  });

  server.run({
    hostname: "localhost",
    port: 5000
  });

  let response = await members.fetch.get("http://localhost:5000/");

  members.assert.responseJsonEquals(
    await response.text(),
    "Missing header, guy.",
  );

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server before_request: wrong header", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [BeforeRequest],
      },
    },
    resources: [ResourceWithMiddlewareHooked],
  });

  server.run({
    hostname: "localhost",
    port: 6000
  });

  let response = await members.fetch.get("http://localhost:6000/", {
    headers: {
      before: "yes",
    },
  });

  members.assert.responseJsonEquals(
    await response.text(),
    "Ha... try again. Close though.",
  );

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server before_request: pass", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [BeforeRequest],
      },
    },
    resources: [ResourceWithMiddlewareHooked],
  });

  server.run({
    hostname: "localhost",
    port: 7000
  });

  let response = await members.fetch.get("http://localhost:7000/", {
    headers: {
      before: "yesss",
    },
  });

  members.assert.responseJsonEquals(await response.text(), "got");

  server.close();
});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class ResourceWithMiddleware extends members.Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  static middleware = {
    before_request: ["UserIsAdmin"],
  };
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

class ResourceWithMiddlewareHooked extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

class ResourceWithMiddlewareNotFound extends members.Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  static middleware = {
    before_request: ["muahahaha"],
  };
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

class BeforeRequest extends members.Drash.Http.Middleware {
  public run() {
    if (!this.request.getHeaderParam("before")) {
      throw new members.Drash.Exceptions.HttpException(
        400,
        "Missing header, guy.",
      );
    }
    if (this.request.getHeaderParam("before") != "yesss") {
      throw new members.Drash.Exceptions.HttpException(
        400,
        "Ha... try again. Close though.",
      );
    }

    this.request.hello = "changed_before_request";
  }
}

class AfterRequest extends members.Drash.Http.Middleware {
  public run() {
    if (!this.request.getHeaderParam("send_response")) {
      throw new members.Drash.Exceptions.HttpException(
        400,
        "Missing header, guy.",
      );
    }
    if (this.request.getHeaderParam("send_response") != "yes do it") {
      throw new members.Drash.Exceptions.HttpException(
        400,
        "Ha... try again. Close though.",
      );
    }
  }
}

class UserIsAdmin extends members.Drash.Http.Middleware {
  protected user_id = 999; // simulate DB data
  public run() {
    if (!this.request.getHeaderParam("user_id")) {
      throw new members.Drash.Exceptions.HttpMiddlewareException(
        400,
        "'user_id' not specified.",
      );
    }
    if (this.request.getHeaderParam("user_id") != this.user_id) {
      throw new members.Drash.Exceptions.HttpMiddlewareException(
        400,
        "'user_id' unknown.",
      );
    }
  }
}

class VerifyCsrfToken extends members.Drash.Http.Middleware {
  public run() {
    if (!this.request.getHeaderParam("csrf_token")) {
      throw new members.Drash.Exceptions.HttpException(
        400,
        "No CSRF token, dude.",
      );
    }
    if (this.request.getHeaderParam("csrf_token") != "all your base") {
      throw new members.Drash.Exceptions.HttpException(
        400,
        "Wrong CSRF token, dude.",
      );
    }
  }
}
