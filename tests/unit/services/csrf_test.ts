import { CSRFService } from "../../../src/services/csrf/csrf.ts";
import { Rhum } from "../../deps.ts";
import {
  IResource,
  Request,
  Resource,
  Response,
  Server,
} from "../../../mod.ts";

const csrfWithoutCookie = new CSRFService();
const csrfWithCookie = new CSRFService({ cookie: true });

/**
 * This resource resembles the following:
 *     1. On any route other than login/register/etc, supply the csrf token on GET requests
 *     2. On requests MADE to the server,  check the token was passed in
 */
class ResourceNoCookie extends Resource implements IResource {
  paths = ["/"];

  public services = {
    "POST": [csrfWithoutCookie],
  };

  public GET(_request: Request, response: Response) {
    // Give token to the 'view'
    response.headers.set("X-CSRF-TOKEN", csrfWithoutCookie.token);
    response.text(csrfWithoutCookie.token);
  }

  public POST(_request: Request, response: Response) {
    // request should have token
    response.text("Success; " + csrfWithoutCookie.token);
  }
}

class ResourceWithCookie extends Resource {
  paths = ["/cookie"];

  public services = {
    "POST": [csrfWithCookie],
  };

  public GET(_request: Request, response: Response) {
    // Give token to the 'view'
    response.setCookie({
      name: "X-CSRF-TOKEN",
      value: csrfWithCookie.token,
    });
    response.text(csrfWithCookie.token);
  }

  public POST(_request: Request, response: Response) {
    // request should have token
    response.text("Success; " + csrfWithCookie.token);
  }
}

const server = new Server({
  resources: [ResourceNoCookie, ResourceWithCookie],
  protocol: "http",
  port: 1337,
  hostname: "localhost",
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
        const firstRes = await fetch("http://localhost:1337", {
          headers: {
            Accept: "text/plain",
          },
        });
        await firstRes.arrayBuffer();
        Rhum.asserts.assertEquals(
          firstRes.headers.get("X-CSRF-TOKEN") === csrfWithoutCookie.token,
          true,
        );
        const secondRes = await fetch("http://localhost:1337", {
          headers: {
            Accept: "text/plain",
          },
        });
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
      const firstRes = await fetch("http://localhost:1337", {
        headers: {
          Accept: "text/plain",
        },
      });
      const token = firstRes.headers.get("X-CSRF-TOKEN");
      await firstRes.arrayBuffer();
      const secondRes = await fetch("http://localhost:1337", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": token || "", // bypass annoying tsc warnings
          Accept: "text/plain",
        },
      });
      Rhum.asserts.assertEquals(
        await secondRes.text(),
        "Success; " + token,
      );
      Rhum.asserts.assertEquals(secondRes.status, 200);
      server.close();
    });
    Rhum.testCase(
      "Route with CSRF should throw a 400 when no token",
      async () => {
        server.run();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
          headers: {
            Accept: "text/plain",
          },
        });
        Rhum.asserts.assertEquals(res.status, 400);
        Rhum.asserts.assertEquals(
          (await res.text()).startsWith("Error: No CSRF token was passed in"),
          true,
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
            Accept: "text/plain",
          },
        });
        Rhum.asserts.assertEquals(res.status, 403);
        Rhum.asserts.assertEquals(
          (await res.text()).startsWith(
            "Error: The CSRF tokens do not match",
          ),
          true,
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
            Accept: "text/plain",
          },
        });
        Rhum.asserts.assertEquals(res.status, 200);
        Rhum.asserts.assertEquals(
          await res.text(),
          "Success; " + csrfWithoutCookie.token,
        );
        server.close();
      },
    );
    Rhum.testCase("Should allow to set the token as a cookie", async () => {
      server.run();
      const res = await fetch("http://localhost:1337/cookie", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.text();
      const headers = res.headers;
      const token = headers.get("set-cookie")!.split("=")[1];
      Rhum.asserts.assertEquals(token, csrfWithCookie.token);
      server.close();
    });
  });
});

Rhum.run();
