import members from "../../members.ts";

members.test(async function Server_handleHttpRequest_GET() {
  let server = new members.MockServer({
    resources: [HomeResource]
  });

  server.handleHttpRequest(members.mockRequest())
    .then((response) => {
      members.assert.equal(
        members.decoder.decode(response.body),
        `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
      );
    });
});

members.test(async function Server_handleHttpRequest_POST() {
  let server = new members.MockServer({
    resources: [HomeResource]
  });

  server.handleHttpRequest(members.mockRequest("/", "POST"))
    .then((response) => {
      members.assert.equal(
        members.decoder.decode(response.body),
        `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"POST"},"body":"got this"}`
      );
    });
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_global_local_fail_no_csrf_token() {
  let server = new members.MockServer({
    middleware: {
      global: [
        VerifyCsrfToken
      ],
      local: [
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

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":400,"status_message":"Bad Request","request":{"url":"/users/1","method":"GET"},"body":"No CSRF token, dude."}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_global_local_wrong_csrf_token() {
  let server = new members.MockServer({
    middleware: {
      global: [
        VerifyCsrfToken
      ],
      local: [
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

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":400,"status_message":"Bad Request","request":{"url":"/users/1","method":"GET"},"body":"Wrong CSRF token, dude."}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_global_local_user_is_not_admin() {
  let server = new members.MockServer({
    middleware: {
      global: [
        VerifyCsrfToken
      ],
      local: [
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

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":400,"status_message":"Bad Request","request":{"url":"/users/1","method":"GET"},"body":"'user_id' unknown."}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_global_local_pass() {
  let server = new members.MockServer({
    middleware: {
      global: [
        VerifyCsrfToken
      ],
      local: [
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

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":200,"status_message":"OK","request":{"url":"/users/1","method":"GET"},"body":{\"name\":\"Thor\"}}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_global_local_middleware_not_found() {
  let server = new members.MockServer({
    middleware: {
      local: [
        UserIsAdmin
      ]
    },
    resources: [
      ResourceWithMiddlewareNotFound
    ]
  });
  
  let response = await server.handleHttpRequest(members.mockRequest("/users/1", "get"));

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":418,"status_message":"I'm a teapot","request":{"url":"/users/1","method":"GET"},"body":\"I'm a teapot\"}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_before_response_fail_missing_header() {
  let server = new members.MockServer({
    middleware: {
      global: [
        BeforeResponse
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });

  let response = await server.handleHttpRequest(members.mockRequest("/", "get"));

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":400,"status_message":"Bad Request","request":{"url":"/","method":"GET"},"body":\"Missing header, guy.\"}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_before_response_fail_wrong_header() {
  let server = new members.MockServer({
    middleware: {
      global: [
        BeforeResponse
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });

  let response = await server.handleHttpRequest(members.mockRequest("/", "get", {send_response: "yes please"}));

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":400,"status_message":"Bad Request","request":{"url":"/","method":"GET"},"body":"Ha... try again. Close though."}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_before_response_pass() {
  let server = new members.MockServer({
    middleware: {
      global: [
        BeforeResponse
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });

  let response = await server.handleHttpRequest(members.mockRequest("/", "get", {send_response: "yes do it"}));

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_after_response_fail_missing_header() {
  let server = new members.MockServer({
    middleware: {
      global: [
        AfterResponse
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });

  let request = members.mockRequest("/", "get");
  let response = await server.handleHttpRequest(request);

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
  );

  members.assert.equal(request.hello, undefined);
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_after_response_fail_wrong_header() {
  let server = new members.MockServer({
    middleware: {
      global: [
        AfterResponse
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });

  let request = members.mockRequest("/", "get", {process_stuff_after: "yes please"});
  let response = await server.handleHttpRequest(request);

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
  );

  members.assert.equal(request.hello, undefined);
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_after_response_pass() {
  let server = new members.MockServer({
    middleware: {
      global: [
        AfterResponse
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });
  let request = members.mockRequest("/", "get", {process_stuff_after: "yes do it"});
  let response = await server.handleHttpRequest(request);

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
  );

  members.assert.equal(request.hello, "changed_after_response");
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_before_request_fail_missing_header() {
  let server = new members.MockServer({
    middleware: {
      global: [
        BeforeRequest
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });
  let request = members.mockRequest("/", "get");
  let response = await server.handleHttpRequest(request);

  members.assert.equal(request.hello, undefined);

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":400,"status_message":"Bad Request","request":{"url":"/","method":"GET"},"body":"Missing header, guy."}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_before_request_fail_wrong_header() {
  let server = new members.MockServer({
    middleware: {
      global: [
        BeforeRequest
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });
  let request = members.mockRequest("/", "get", {before: "yes"});
  let response = await server.handleHttpRequest(request);

  members.assert.equal(request.hello, undefined);

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":400,"status_message":"Bad Request","request":{"url":"/","method":"GET"},"body":"Ha... try again. Close though."}`
  );
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test(async function Server_handleHttpRequest_middleware_before_request_pass() {
  let server = new members.MockServer({
    middleware: {
      global: [
        BeforeRequest
      ]
    },
    resources: [
      ResourceWithMiddlewareHooked
    ]
  });
  let request = members.mockRequest("/", "get", {before: "yesss"});
  let response = await server.handleHttpRequest(request);

  members.assert.equal(request.hello, "changed_before_request");

  members.assert.equal(
    members.decoder.decode(response.body),
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
  );
});

////////////////////////////////////////////////////////////////////////////////
// DATA ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends members.Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "got";
    return this.response;
  }
  public POST() {
    this.response.body = "got this";
    return this.response;
  }
}

class ResourceWithMiddleware extends members.Drash.Http.Resource {
  static paths = ["/users/:id", "/users/:id/"];
  static middleware = ["UserIsAdmin"];
  public users = {
    1: {
      name: "Thor"
    },
    2: {
      name: "Hulk"
    },
  };
  public GET() {
    this.response.body = this.users[this.request.getPathVar('id')];
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
  static middleware = ["muahahaha"];
  public users = {
    1: {
      name: "Thor"
    },
    2: {
      name: "Hulk"
    },
  };
  public GET() {
    this.response.body = this.users[this.request.getPathVar('id')];
    return this.response;
  }
}

class AfterResponse extends members.Drash.Http.Middleware {
  static locations = [
    "after_response"
  ];
  public run(request: any) {
    if (!request.getHeaderVar('process_stuff_after')) {
      throw new members.Drash.Exceptions.HttpException(400, "Missing header, guy.");
    }
    if (request.getHeaderVar('process_stuff_after') != "yes do it") {
      throw new members.Drash.Exceptions.HttpException(400, "Ha... try again. Close though.");
    }

    request.hello = "changed_after_response";
  }
}

class BeforeRequest extends members.Drash.Http.Middleware {
  static locations = [
    "before_request"
  ];
  public run(request: any) {
    if (!request.getHeaderVar('before')) {
      throw new members.Drash.Exceptions.HttpException(400, "Missing header, guy.");
    }
    if (request.getHeaderVar('before') != "yesss") {
      throw new members.Drash.Exceptions.HttpException(400, "Ha... try again. Close though.");
    }

    request.hello = "changed_before_request";
  }
}

class BeforeResponse extends members.Drash.Http.Middleware {
  static locations = [
    "before_response"
  ];
  public run(request: any) {
    if (!request.getHeaderVar('send_response')) {
      throw new members.Drash.Exceptions.HttpException(400, "Missing header, guy.");
    }
    if (request.getHeaderVar('send_response') != "yes do it") {
      throw new members.Drash.Exceptions.HttpException(400, "Ha... try again. Close though.");
    }
  }
}

class UserIsAdmin extends members.Drash.Http.Middleware {
  protected user_id = 999; // simulate DB data
  public run(request: any) {
    if (!request.getHeaderVar('user_id')) {
      throw new members.Drash.Exceptions.HttpMiddlewareException(400, "'user_id' not specified.");
    }
    if (request.getHeaderVar('user_id') != this.user_id) {
      throw new members.Drash.Exceptions.HttpMiddlewareException(400, "'user_id' unknown.");
    }
  }
}

class VerifyCsrfToken extends members.Drash.Http.Middleware {
  public run(request: any) {
    if (!request.getHeaderVar('csrf_token')) {
      throw new members.Drash.Exceptions.HttpException(400, "No CSRF token, dude.");
    }
    if (request.getHeaderVar('csrf_token') != "all your base") {
      throw new members.Drash.Exceptions.HttpException(400, "Wrong CSRF token, dude.");
    }
  }
}
