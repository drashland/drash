import members from "../../members.ts";

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server/resource: missing CSRF token", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [
          VerifyCsrfToken
        ]
      },
      resource_level: [
        UserIsAdmin
      ]
    },
    resources: [
      ResourceWithMiddleware
    ]
  });

  let response = await server.handleHttpRequest(
    members.mockRequest(
      "/users/1",
      "get"
    )
  );

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 400,
      status_message: "Bad Request",
      body: "No CSRF token, dude.",
      request: {
        method: "GET",
        uri: "/users/1",
        url_query_params: {},
        url: "127.0.0.1:8000/users/1"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server/resource: wrong CSRF token", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [
          VerifyCsrfToken
        ]
      },
      resource_level: [
        UserIsAdmin
      ]
    },
    resources: [
      ResourceWithMiddleware
    ]
  });

  let response = await server.handleHttpRequest(
    members.mockRequest(
      "/users/1",
      "get",
      {
        csrf_token: "hehe"
      }
    )
  );

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 400,
      status_message: "Bad Request",
      body: "Wrong CSRF token, dude.",
      request: {
        method: "GET",
        uri: "/users/1",
        url_query_params: {},
        url: "127.0.0.1:8000/users/1"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server/resource: user is not an admin", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [
          VerifyCsrfToken
        ]
      },
      resource_level: [
        UserIsAdmin
      ]
    },
    resources: [
      ResourceWithMiddleware
    ]
  });

  let response = await server.handleHttpRequest(
    members.mockRequest(
      "/users/1",
      "get",
      {
        csrf_token: "all your base",
        user_id: 123
      }
    )
  );

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 400,
      status_message: "Bad Request",
      body: "'user_id' unknown.",
      request: {
        method: "GET",
        uri: "/users/1",
        url_query_params: {},
        url: "127.0.0.1:8000/users/1"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server/resource: pass", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [
          VerifyCsrfToken
        ],
      },
      resource_level: [
        UserIsAdmin
      ]
    },
    resources: [
      ResourceWithMiddleware
    ]
  });
  
  let response = await server.handleHttpRequest(
    members.mockRequest(
      "/users/1",
      "get",
      {
        csrf_token: "all your base",
        user_id: 999
      }
    )
  );

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 200,
      status_message: "OK",
      body: {
        name: "Thor"
      },
      request: {
        method: "GET",
        uri: "/users/1",
        url_query_params: {},
        url: "127.0.0.1:8000/users/1"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server/resource: middleware not found", async () => {
  let server = new members.MockServer({
    middleware: {
      resource_level: [
        UserIsAdmin
      ]
    },
    resources: [
      ResourceWithMiddlewareNotFound
    ]
  });
  
  let response = await server.handleHttpRequest(members.mockRequest("/users/1", "get"));

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 418,
      status_message: "I'm a teapot",
      body: "I'm a teapot",
      request: {
        method: "GET",
        uri: "/users/1",
        url_query_params: {},
        url: "127.0.0.1:8000/users/1"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server before_response: missing header", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        after_request: [
          AfterRequest
        ]
      }
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });

  let response = await server.handleHttpRequest(members.mockRequest("/", "get"));

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 400,
      status_message: "Bad Request",
      body: "Missing header, guy.",
      request: {
        method: "GET",
        uri: "/",
        url_query_params: {},
        url: "127.0.0.1:8000/"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server before_response: wrong header", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        after_request: [
          AfterRequest
        ]
      }
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });

  let response = await server.handleHttpRequest(members.mockRequest("/", "get", {send_response: "yes please"}));

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 400,
      status_message: "Bad Request",
      body: "Ha... try again. Close though.",
      request: {
        method: "GET",
        uri: "/",
        url_query_params: {},
        url: "127.0.0.1:8000/"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server before_response: pass", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        after_request: [
          AfterRequest
        ]
      }
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });

  let response = await server.handleHttpRequest(members.mockRequest("/", "get", {send_response: "yes do it"}));

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 200,
      status_message: "OK",
      body: "got",
      request: {
        method: "GET",
        uri: "/",
        url_query_params: {},
        url: "127.0.0.1:8000/"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server before_request: missing header", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [
          BeforeRequest
        ]
      }
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });
  let request = members.mockRequest("/", "get");
  let response = await server.handleHttpRequest(request);

  members.assert.equal(request.hello, undefined);

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 400,
      status_message: "Bad Request",
      body: "Missing header, guy.",
      request: {
        method: "GET",
        uri: "/",
        url_query_params: {},
        url: "127.0.0.1:8000/"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server before_request: wrong header", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [
          BeforeRequest
        ]
      }
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });
  let request = members.mockRequest("/", "get", {before: "yes"});
  let response = await server.handleHttpRequest(request);

  members.assert.equal(request.hello, undefined);

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 400,
      status_message: "Bad Request",
      body: "Ha... try again. Close though.",
      request: {
        method: "GET",
        uri: "/",
        url_query_params: {},
        url: "127.0.0.1:8000/"
      }
    }
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("Middleware server before_request: pass", async () => {
  let server = new members.MockServer({
    middleware: {
      server_level: {
        before_request: [
          BeforeRequest
        ]
      }
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });
  let request = members.mockRequest("/", "get", {before: "yesss"});
  let response = await server.handleHttpRequest(request);

  members.assert.equal(request.hello, "changed_before_request");

  members.assert.responseJsonEquals(
    response.body,
    {
      status_code: 200,
      status_message: "OK",
      body: "got",
      request: {
        method: "GET",
        uri: "/",
        url_query_params: {},
        url: "127.0.0.1:8000/"
      }
    }
  );
});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class ResourceWithMiddleware extends members.Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  static middleware = {
    before_request: [
      "UserIsAdmin"
    ]
  };
  public users = {
    1: {
      name: "Thor"
    },
    2: {
      name: "Hulk"
    },
  };
  public GET() {
    this.response.body = this.users[this.request.getPathParam('id')];
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
    before_request: [
      "muahahaha"
    ]
  };
  public users = {
    1: {
      name: "Thor"
    },
    2: {
      name: "Hulk"
    },
  };
  public GET() {
    this.response.body = this.users[this.request.getPathParam('id')];
    return this.response;
  }
}

class BeforeRequest extends members.Drash.Http.Middleware {
  public run() {
    if (!this.request.getHeaderParam('before')) {
      throw new members.Drash.Exceptions.HttpException(400, "Missing header, guy.");
    }
    if (this.request.getHeaderParam('before') != "yesss") {
      throw new members.Drash.Exceptions.HttpException(400, "Ha... try again. Close though.");
    }

    this.request.hello = "changed_before_request";
  }
}

class AfterRequest extends members.Drash.Http.Middleware {
  public run() {
    if (!this.request.getHeaderParam('send_response')) {
      throw new members.Drash.Exceptions.HttpException(400, "Missing header, guy.");
    }
    if (this.request.getHeaderParam('send_response') != "yes do it") {
      throw new members.Drash.Exceptions.HttpException(400, "Ha... try again. Close though.");
    }
  }
}

class UserIsAdmin extends members.Drash.Http.Middleware {
  protected user_id = 999; // simulate DB data
  public run() {
    if (!this.request.getHeaderParam('user_id')) {
      throw new members.Drash.Exceptions.HttpMiddlewareException(400, "'user_id' not specified.");
    }
    if (this.request.getHeaderParam('user_id') != this.user_id) {
      throw new members.Drash.Exceptions.HttpMiddlewareException(400, "'user_id' unknown.");
    }
  }
}

class VerifyCsrfToken extends members.Drash.Http.Middleware {
  public run() {
    if (!this.request.getHeaderParam('csrf_token')) {
      throw new members.Drash.Exceptions.HttpException(400, "No CSRF token, dude.");
    }
    if (this.request.getHeaderParam('csrf_token') != "all your base") {
      throw new members.Drash.Exceptions.HttpException(400, "Wrong CSRF token, dude.");
    }
  }
}
