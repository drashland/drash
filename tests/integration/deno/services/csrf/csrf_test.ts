import { assertEquals, Drash, TestHelpers } from "../../deps.ts";
import { CSRFService } from "../../../../../services/deno/csrf/csrf.ts";

// FILE MARKER - APP SETUP /////////////////////////////////////////////////////

const csrfWithoutCookie = new CSRFService();
const csrfWithCookie = new CSRFService({ cookie: true });

/**
 * This resource resembles the following:
 *     1. On any route other than login/register/etc, supply the csrf token on GET requests
 *     2. On requests MADE to the server,  check the token was passed in
 */
class ResourceNoCookie extends Drash.Resource {
  paths = ["/"];

  public services = {
    "POST": [csrfWithoutCookie],
  };

  public GET(_request: Drash.Request, response: Drash.Response) {
    // Give token to the 'view'
    response.headers({ "X-CSRF-TOKEN": csrfWithoutCookie.token });
    return response.text(csrfWithoutCookie.token);
  }

  public POST(_request: Drash.Request, response: Drash.Response) {
    // request should have token
    return response.text("Success; " + csrfWithoutCookie.token);
  }
}

class ResourceWithCookie extends Drash.Resource {
  paths = ["/cookie"];

  public services = {
    "POST": [csrfWithCookie],
  };

  public GET(_request: Drash.Request, response: Drash.Response) {
    // Give token to the 'view'
    return response
      .cookies({
        "X-CSRF-TOKEN": {
          value: csrfWithCookie.token,
        },
      })
      .text(csrfWithCookie.token);
  }

  public POST(_request: Drash.Request, response: Drash.Response) {
    // request should have token
    return response.text("Success; " + csrfWithCookie.token);
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [ResourceNoCookie, ResourceWithCookie],
  });

  const denoRequestHandler = (request: Request) => {
    return NativeRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(1337)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

// FILE MARKER - TESTS /////////////////////////////////////////////////////////

Deno.test("CSRF - mod_test.ts", async (t) => {
  await t.step("csrf", async (t) => {
    await t.step("`csrf.token` Should return a valid token", () => {
      assertEquals(
        csrfWithoutCookie.token.match("[a-zA-Z0-9]{43}") !== null,
        true,
      );
    });
    await t.step(
      "Token should be the same for different requests",
      async () => {
        const server = await runServer();
        const firstRes = await fetch("http://localhost:1337", {
          headers: {
            Accept: "text/plain",
          },
        });
        await firstRes.arrayBuffer();
        assertEquals(
          firstRes.headers.get("X-CSRF-TOKEN") === csrfWithoutCookie.token,
          true,
        );
        const secondRes = await fetch("http://localhost:1337", {
          headers: {
            Accept: "text/plain",
          },
        });
        await secondRes.arrayBuffer();
        assertEquals(
          secondRes.headers.get("X-CSRF-TOKEN") === csrfWithoutCookie.token,
          true,
        );
        await server.close();
      },
    );
    await t.step("Token can be used for other requests", async () => { // eg get it from a route, and use it in the view for sending other requests
      const server = await runServer();
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
      assertEquals(
        await secondRes.text(),
        "Success; " + token,
      );
      assertEquals(secondRes.status, 200);
      await server.close();
    });
    await t.step(
      "Route with CSRF should throw a 400 when no token",
      async () => {
        const server = await runServer();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
          headers: {
            Accept: "text/plain",
          },
        });
        assertEquals(res.status, 400);
        assertEquals(
          (await res.text()).startsWith("Error: No CSRF token was passed in"),
          true,
        );
        await server.close();
      },
    );
    await t.step(
      "Route with CSRF should throw 403 for an invalid token",
      async () => {
        const server = await runServer();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfWithoutCookie.token.substring(
              1,
              "X-CSRF-TOKEN".length,
            ),
            Accept: "text/plain",
          },
        });
        assertEquals(res.status, 403);
        assertEquals(
          (await res.text()).startsWith(
            "Error: The CSRF tokens do not match",
          ),
          true,
        );
        await server.close();
      },
    );
    // This test asserts that the token is consistent when passed about, and will not change
    await t.step(
      "Route should respond with success when passing in token",
      async () => {
        const server = await runServer();
        const res = await fetch("http://localhost:1337", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfWithoutCookie.token,
            Accept: "text/plain",
          },
        });
        assertEquals(res.status, 200);
        assertEquals(
          await res.text(),
          "Success; " + csrfWithoutCookie.token,
        );
        await server.close();
      },
    );
    await t.step("Should allow to set the token as a cookie", async () => {
      const server = await runServer();
      const res = await fetch("http://localhost:1337/cookie", {
        headers: {
          Accept: "text/plain",
        },
      });
      await res.text();
      const headers = res.headers;
      const token = headers.get("set-cookie")?.split("=")[1];
      assertEquals(token, csrfWithCookie.token);
      await server.close();
    });
  });
});
