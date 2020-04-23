import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server: missing CSRF token", async () => {
  let server = new members.MockServer({
    middleware: {
      before_request: [VerifyCsrfToken],
    },
    resources: [ResourceWithMiddleware],
  });

  server.run({
    hostname: "localhost",
    port: 1557,
  });

  let response = await members.fetch.get("http://localhost:1557/users/1");

  members.assert.responseJsonEquals(
    await response.text(),
    "No CSRF token, dude.",
  );

  server.close();
});

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server: wrong CSRF token", async () => {
  let server = new members.MockServer({
    middleware: {
      before_request: [VerifyCsrfToken],
    },
    resources: [ResourceWithMiddleware],
  });

  server.run({
    hostname: "localhost",
    port: 1667,
  });

  let response = await members.fetch.get("http://localhost:1667/users/1", {
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
members.test(
  "middleware_test.ts | server before_response: missing header",
  async () => {
    let server = new members.MockServer({
      middleware: {
        after_request: [AfterRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });

    server.run({
      hostname: "localhost",
      port: 1777,
    });

    let response = await members.fetch.get("http://localhost:1777/");

    members.assert.responseJsonEquals(
      await response.text(),
      "Missing header, guy.",
    );

    server.close();
  },
);

/**
 * @covers Server.handleHttpRequest()
 */
members.test(
  "middleware_test.ts | server before_response: wrong header",
  async () => {
    let server = new members.MockServer({
      middleware: {
        after_request: [AfterRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });

    server.run({
      hostname: "localhost",
      port: 3000,
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
  },
);

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server before_response: pass", async () => {
  let server = new members.MockServer({
    middleware: {
      after_request: [AfterRequest],
    },
    resources: [ResourceWithMiddlewareHooked],
  });

  server.run({
    hostname: "localhost",
    port: 4000,
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
members.test(
  "middleware_test.ts | server before_request: missing header",
  async () => {
    let server = new members.MockServer({
      middleware: {
        before_request: [BeforeRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });

    server.run({
      hostname: "localhost",
      port: 5000,
    });

    let response = await members.fetch.get("http://localhost:5000/");

    members.assert.responseJsonEquals(
      await response.text(),
      "Missing header, guy.",
    );

    server.close();
  },
);

/**
 * @covers Server.handleHttpRequest()
 */
members.test(
  "middleware_test.ts | server before_request: wrong header",
  async () => {
    let server = new members.MockServer({
      middleware: {
        before_request: [BeforeRequest],
      },
      resources: [ResourceWithMiddlewareHooked],
    });

    server.run({
      hostname: "localhost",
      port: 6000,
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
  },
);

/**
 * @covers Server.handleHttpRequest()
 */
members.test("middleware_test.ts | server before_request: pass", async () => {
  let server = new members.MockServer({
    middleware: {
      before_request: [BeforeRequest],
    },
    resources: [ResourceWithMiddlewareHooked],
  });

  server.run({
    hostname: "localhost",
    port: 7000,
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

function BeforeRequest(req: any) {
  if (!req.getHeaderParam("before")) {
    throw new members.Drash.Exceptions.HttpException(
      400,
      "Missing header, guy.",
    );
  }
  if (req.getHeaderParam("before") != "yesss") {
    throw new members.Drash.Exceptions.HttpException(
      400,
      "Ha... try again. Close though.",
    );
  }

  req.hello = "changed_before_request";
}

function AfterRequest(req: any, res: Drash.Http.Response) {
  if (!req.getHeaderParam("send_response")) {
    throw new members.Drash.Exceptions.HttpException(
      400,
      "Missing header, guy.",
    );
  }
  if (req.getHeaderParam("send_response") != "yes do it") {
    throw new members.Drash.Exceptions.HttpException(
      400,
      "Ha... try again. Close though.",
    );
  }
}

function VerifyCsrfToken(req: any) {
  if (!req.getHeaderParam("csrf_token")) {
    throw new members.Drash.Exceptions.HttpException(
      400,
      "No CSRF token, dude.",
    );
  }
  if (req.getHeaderParam("csrf_token") != "all your base") {
    throw new members.Drash.Exceptions.HttpException(
      400,
      "Wrong CSRF token, dude.",
    );
  }
}
