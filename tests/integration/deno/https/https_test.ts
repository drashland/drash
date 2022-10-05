import { assertEquals, Drash, TestHelpers } from "../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class BrowserRequestResource extends Drash.Resource {
  paths = ["/browser-request"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.text("hello");
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const drashRequestHandler = await Drash.createRequestHandler({
    resources: [BrowserRequestResource],
  });

  const denoRequestHandler = (request: Request) => {
    return drashRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(3000)
    .asHttps(
      "./tests/integration/deno/data/server.key",
      "./tests/integration/deno/data/server.crt",
    )
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("browser_request_resource.ts", async (t) => {
  await t.step("GET (https) /browser-request", async (t) => {
    await t.step("Response should be JSON", async () => {
      const server = await runServer();
      // Example browser request
      const response = await TestHelpers.makeRequest.get(
        "https://localhost:3000/browser-request",
        {
          headers: {
            Accept: "*/*",
          },
        },
      );
      await server.close();
      assertEquals(await response.text(), "hello");
      assertEquals(
        response.headers.get("Content-Type"),
        "text/plain",
      );
    });
  });
});
