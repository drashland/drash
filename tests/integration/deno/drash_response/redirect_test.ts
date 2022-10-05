import { assertEquals, Drash, TestHelpers } from "../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class Res0 extends Drash.Resource {
  paths = ["/"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.redirect("http://localhost:3000/redirect").status(307);
  }
}

class Res1 extends Drash.Resource {
  paths = ["/redirects-with-307"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.redirect("http://localhost:3000/redirect").status(307);
  }
}

class Res2 extends Drash.Resource {
  paths = ["/redirect"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.text("hello");
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const drashRequestHandler = await Drash.createRequestHandler({
    resources: [
      Res0,
      Res1,
      Res2,
    ],
  });

  const denoRequestHandler = (request: Request) => {
    return drashRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(3000)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("redirect_test.ts", async (t) => {
  await t.step("GET /", async (t) => {
    await t.step("Should redirect to another resource", async () => {
      const server = await runServer();
      // Example browser request
      const response = await fetch(server.address);
      await server.close();
      assertEquals(await response.text(), "hello");
      assertEquals(response.status, 200);
    });
    await t.step(
      "Should respect the status code during redirection",
      async () => {
        const server = await runServer();
        // Example browser request
        const response = await fetch(server.address + "/redirects-with-307", {
          redirect: "manual",
        });
        await server.close();
        assertEquals(await response.text(), "");
        assertEquals(response.status, 307);
      },
    );
  });
});
