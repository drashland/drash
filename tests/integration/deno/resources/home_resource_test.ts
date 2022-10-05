import { assertEquals, Drash, TestHelpers } from "../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends Drash.Resource {
  paths = ["/", "/home"];

  public GET(_request: Drash.Request, response: Drash.Response) {
    return response.text("GET request received!");
  }

  public POST(_request: Drash.Request, response: Drash.Response) {
    return response.text("POST request received!");
  }

  public PUT(_request: Drash.Request, response: Drash.Response) {
    return response.text("PUT request received!");
  }

  public DELETE(_request: Drash.Request, response: Drash.Response) {
    return response.text("DELETE request received!");
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [HomeResource],
  });

  const denoRequestHandler = (request: Request) => {
    return NativeRequestHandler.handle(request);
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

Deno.test("home_resource_test.ts", async (t) => {
  await t.step("/", async (t) => {
    await t.step("only defined methods are accessible", async () => {
      const server = await runServer();

      let response;

      response = await TestHelpers.makeRequest.get("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(
        await response.text(),
        "GET request received!",
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        await response.text(),
        "GET request received!",
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home/",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        await response.text(),
        "GET request received!",
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home//",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      response = await TestHelpers.makeRequest.post("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(
        await response.text(),
        "POST request received!",
      );

      response = await TestHelpers.makeRequest.put("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(
        await response.text(),
        "PUT request received!",
      );

      response = await TestHelpers.makeRequest.delete("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(
        await response.text(),
        "DELETE request received!",
      );

      response = await TestHelpers.makeRequest.patch("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(
        (await response.text()).split("\n")[0],
        "Error: Not Implemented",
      );

      await server.close();
    });
  });
});
