import { assertEquals, Drash, TestHelpers } from "../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class CookieResource extends Drash.Resource {
  paths = ["/cookie", "/cookie/"];

  public GET(request: Drash.Request, response: Drash.Response) {
    const cookieValue = request.cookie("testCookie");
    return response.text(cookieValue);
  }

  public POST(_request: Drash.Request, response: Drash.Response) {
    return response.cookies({ "testCookie": { value: "Drash" } })
      .text("Saved your cookie!");
  }

  public DELETE(_request: Drash.Request, response: Drash.Response) {
    return response.text("DELETE request received!")
      .deleteCookies(["testCookie"]);
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [CookieResource],
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

Deno.test("cookie_resource_test.ts", async (t) => {
  await t.step("/cookie", async (t) => {
    await t.step("cookie can be created, retrieved, and deleted", async () => {
      const server = await runServer();

      let response;
      const cookie = { name: "testCookie", value: "Drash" };

      // Post
      response = await TestHelpers.makeRequest.post(
        "http://localhost:3000/cookie",
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "text/plain",
          },
          body: cookie,
        },
      );
      assertEquals(await response.text(), "Saved your cookie!");

      // Get - Dependent on the above post request saving a cookie
      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/cookie",
        {
          credentials: "same-origin",
          headers: {
            Cookie: "testCookie=Drash",
            Accept: "text/plain",
          },
        },
      );
      await assertEquals(await response.text(), "Drash");

      // Remove - Dependent on the above post request saving a cookie
      response = await TestHelpers.makeRequest.delete(
        "http://localhost:3000/cookie",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      const cookies = response.headers.get("set-cookie") || "";
      const cookieVal = cookies.split(";")[0].split("=")[1];
      assertEquals(cookieVal, "");
      await response.arrayBuffer();
      //await response.body.close()

      await server.close();
    });
  });
});
