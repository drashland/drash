import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class CookieResource extends Drash.DrashResource {
  static paths = ["/cookie", "/cookie/"];

  public GET() {
    const cookieValue = this.request.getCookie("testCookie");
    this.response.body = cookieValue;
    return this.response;
  }

  public POST() {
    this.response.setCookie({ name: "testCookie", value: "Drash" });
    this.response.body = "Saved your cookie!";
    return this.response;
  }

  public DELETE() {
    this.response.body = "DELETE request received!";
    this.response.delCookie("testCookie");
    return this.response;
  }
}

const server = new Drash.Server({
  resources: [
    CookieResource,
  ],
  protocol: "http"
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("cookie_resource_test.ts", () => {
  Rhum.testSuite("/cookie", () => {
    Rhum.testCase("cookie can be created, retrieved, and deleted", async () => {
      server.run();

      let response;
      let cookies;
      let cookieVal;

      const cookie = { name: "testCookie", value: "Drash" };

      // Post
      response = await TestHelpers.makeRequest.post(
        "http://localhost:3000/cookie",
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: cookie,
        },
      );
      Rhum.asserts.assertEquals(await response.text(), '"Saved your cookie!"');

      // Get - Dependent on the above post request saving a cookie
      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/cookie",
        {
          credentials: "same-origin",
          headers: {
            Cookie: "testCookie=Drash",
          },
        },
      );
      await Rhum.asserts.assertEquals(await response.text(), '"Drash"');

      // Remove - Dependent on the above post request saving a cookie
      response = await TestHelpers.makeRequest.delete(
        "http://localhost:3000/cookie",
        {
          headers: {},
        },
      );
      cookies = response.headers.get("set-cookie") || "";
      cookieVal = cookies.split(";")[0].split("=")[1];
      Rhum.asserts.assertEquals(cookieVal, "");
      await response.arrayBuffer();
      //await response.body.close()

      server.close();
    });
  });
});

Rhum.run();
