import { CSRFService } from "../../../src/services/csrf/csrf.ts";
import { Rhum } from "../../deps.ts";
import { Resource, IResource, Server, IContext } from "../../../mod.ts"

const csrfWithoutCookie = new CSRFService();
const csrfWithCookie = new CSRFService({ cookie: true });

/**
 * This resource resembles the following:
 *     1. On any route other than login/register/etc, supply the csrf token on GET requests
 *     2. On requests MADE to the server,  check the token was passed in
 */
class ResourceNoCookie extends Resource implements IResource {
  static paths = ["/"];

  public services = {
    'POST': [csrfWithoutCookie]
  }

  public GET(context: IContext) {
    // Give token to the 'view'
    context.response.headers.set("X-CSRF-TOKEN", csrfWithoutCookie.token);
    context.response.body = csrfWithoutCookie.token;
  }

  public POST(context: IContext) {
    // request should have token
    context.response.body = "Success; " + csrfWithoutCookie.token;
  }
}

class ResourceWithCookie extends Resource {
  static paths = ["/cookie"];

  public services = {
    'POST': [csrfWithCookie]
  }

  public GET(context: IContext) {
    // Give token to the 'view'
    context.response.setCookie({
      name: "X-CSRF-TOKEN",
      value: csrfWithCookie.token,
    });
    context.response.body = csrfWithCookie.token;
  }

  public POST(context: IContext) {
    // request should have token
    context.response.body = "Success; " + csrfWithCookie.token;
  }
}

const server = new Server({
  resources: [ResourceNoCookie, ResourceWithCookie],
  protocol: "http",
  port: 1337,
  hostname: "localhost"
});

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
        server.run();
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
      server.run();
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
        'Success; ' + token,
      );
      server.close();
    });
    Rhum.testCase(
      "Route with CSRF should throw a 400 when no token",
      async () => {
        server.run();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
        });
        Rhum.asserts.assertEquals(res.status, 400);
        Rhum.asserts.assertEquals(
         (await res.text()).startsWith('Error: No CSRF token was passed in'), true
        );
        server.close();
      },
    );
    Rhum.testCase(
      "Route with CSRF should throw 403 for an invalid token",
      async () => {
        server.run();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfWithoutCookie.token.substr(1),
          },
        });
        Rhum.asserts.assertEquals(res.status, 403);
        Rhum.asserts.assertEquals(
         (await res.text()).startsWith(
          'Error: The CSRF tokens do not match'), true
        );
        server.close();
      },
    );
    // This test asserts that the token is consistent when passed about, and will not change
    Rhum.testCase(
      "Route should respond with success when passing in token",
      async () => {
        server.run();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfWithoutCookie.token,
          },
        });
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(
          await res.text(),
          'Success; ' + csrfWithoutCookie.token,
        );
        server.close();
      },
    );
    Rhum.testCase("Should allow to set the token as a cookie", async () => {
      server.run();
      const res = await fetch("http://localhost:1337/cookie");
      await res.text();
      const headers = res.headers;
      const token = headers.get("set-cookie")!.split("=")[1];
      Rhum.asserts.assertEquals(token, csrfWithCookie.token);
      server.close();
    });
  });
});

Rhum.run();
