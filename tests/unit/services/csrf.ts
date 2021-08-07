import { CSRF } from "../mod.ts";
import { Drash } from "../../deps.ts";
import { Rhum } from "../../test_deps.ts";

const csrfWithoutCookie = CSRF();
const csrfWithCookie = CSRF({ cookie: true });

/**
 * This resource resembles the following:
 *     1. On any route other than login/register/etc, supply the csrf token on GET requests
 *     2. On requests MADE to the server,  check the token was passed in
 */
class ResourceNoCookie extends Drash.Http.Resource {
  static paths = ["/"];

  public GET() {
    // Give token to the 'view'
    this.response.headers.set("X-CSRF-TOKEN", csrfWithoutCookie.token);
    this.response.body = csrfWithoutCookie.token;
    return this.response;
  }

  @Drash.Http.Middleware({
    before_request: [csrfWithoutCookie],
    after_request: [],
  })
  public POST() {
    // request should have token
    this.response.body = "Success; " + csrfWithoutCookie.token;
    return this.response;
  }
}

class ResourceWithCookie extends Drash.Http.Resource {
  static paths = ["/cookie"];

  public GET() {
    // Give token to the 'view'
    this.response.setCookie({
      name: "X-CSRF-TOKEN",
      value: csrfWithCookie.token,
    });
    this.response.body = csrfWithCookie.token;
    return this.response;
  }

  @Drash.Http.Middleware({
    before_request: [csrfWithCookie],
    after_request: [],
  })
  public POST() {
    // request should have token
    this.response.body = "Success; " + csrfWithCookie.token;
    return this.response;
  }
}

const server = new Drash.Http.Server({
  resources: [ResourceNoCookie, ResourceWithCookie],
});

async function runServer() {
  await server.run({
    hostname: "localhost",
    port: 1337,
  });
}

console.log("Server running");

Rhum.testPlan("CSRF - mod_test.ts", () => {
  Rhum.testSuite("csrf", () => {
    Rhum.testCase("`csrf.token` Should return a valid token", () => {
      Rhum.asserts.assertEquals(
        csrfWithoutCookie.token.match("[a-zA-Z0-9]{43}") !== null,
        true,
      );
    });
    Rhum.testCase(
      "Token should be the same for different requests",
      async () => {
        await runServer();
        const firstRes = await fetch("http://localhost:1337");
        await firstRes.arrayBuffer();
        Rhum.asserts.assertEquals(
          firstRes.headers.get("X-CSRF-TOKEN") === csrfWithoutCookie.token,
          true,
        );
        const secondRes = await fetch("http://localhost:1337");
        await secondRes.arrayBuffer();
        Rhum.asserts.assertEquals(
          secondRes.headers.get("X-CSRF-TOKEN") === csrfWithoutCookie.token,
          true,
        );
        server.close();
      },
    );
    Rhum.testCase("Token can be used for other requests", async () => { // eg get it from a route, and use it in the view for sending other requests
      await runServer();
      const firstRes = await fetch("http://localhost:1337");
      const token = firstRes.headers.get("X-CSRF-TOKEN");
      await firstRes.arrayBuffer();
      const secondRes = await fetch("http://localhost:1337", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": token || "", // bypass annoying tsc warnings
        },
      });
      Rhum.asserts.assertEquals(secondRes.status, 200);
      Rhum.asserts.assertEquals(
        await secondRes.text(),
        '"Success; ' + token + '"',
      );
      server.close();
    });
    Rhum.testCase(
      "Route with CSRF should throw a 400 when no token",
      async () => {
        await runServer();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
        });
        Rhum.asserts.assertEquals(res.status, 400);
        Rhum.asserts.assertEquals(
          await res.text(),
          '"No CSRF token was passed in"',
        );
        server.close();
      },
    );
    Rhum.testCase(
      "Route with CSRF should throw 403 for an invalid token",
      async () => {
        await runServer();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfWithoutCookie.token.substr(1),
          },
        });
        Rhum.asserts.assertEquals(res.status, 403);
        Rhum.asserts.assertEquals(
          await res.text(),
          '"The CSRF tokens do not match"',
        );
        server.close();
      },
    );
    // This test asserts that the token is consistent when passed about, and will not change
    Rhum.testCase(
      "Route should respond with success when passing in token",
      async () => {
        await runServer();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfWithoutCookie.token,
          },
        });
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(
          await res.text(),
          '"Success; ' + csrfWithoutCookie.token + '"',
        );
        server.close();
      },
    );
    Rhum.testCase("Should allow to set the token as a cookie", async () => {
      await runServer();
      const res = await fetch("http://localhost:1337/cookie");
      await res.json();
      const headers = res.headers;
      const token = headers.get("set-cookie")!.split("=")[1];
      Rhum.asserts.assertEquals(token, csrfWithCookie.token);
      server.close();
    });
  });
});

Rhum.run();
