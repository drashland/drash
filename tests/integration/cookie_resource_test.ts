import { Rhum, TestHelpers } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class CookieResource extends Resource {
  paths = ["/cookie", "/cookie/"];

  public GET(request: Request, response: Response) {
    const cookieValue = request.getCookie("testCookie");
    response.text(cookieValue);
  }

  public POST(_request: Request, response: Response) {
    response.setCookie({ name: "testCookie", value: "Drash" });
    response.text("Saved your cookie!");
  }

  public DELETE(_request: Request, response: Response) {
    response.text("DELETE request received!");
    response.deleteCookie("testCookie");
  }
}

const server = new Server({
  resources: [
    CookieResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("cookie_resource_test.ts", () => {
  Rhum.testSuite("/cookie", () => {
    Rhum.testCase("cookie can be created, retrieved, and deleted", async () => {
      server.run();

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
      Rhum.asserts.assertEquals(await response.text(), "Saved your cookie!");

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
      await Rhum.asserts.assertEquals(await response.text(), "Drash");

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
      Rhum.asserts.assertEquals(cookieVal, "");
      await response.arrayBuffer();
      //await response.body.close()

      await server.close();
    });
  });
});

Rhum.run();
