import members from "../../members.ts";
import { Rhum } from "../../test_deps.ts";

Rhum.testPlan("cookie_resource_test.ts", () => {
  Rhum.testSuite("/cookie", () => {
    Rhum.testCase("cookie can be created, retrieved, and deleted", async () => {
      let response;
      let cookies;
      let cookieName;
      let cookieVal;

      const cookie = { name: "testCookie", value: "Drash" };

      // Post
      response = await members.fetch.post("http://localhost:3000/cookie", {
        headers: {
          "Content-Type": "application/json",
        },
        body: cookie,
      });
      members.assertEquals(await response.text(), '"Saved your cookie!"');

      // Get - Dependent on the above post request saving a cookie
      response = await members.fetch.get("http://localhost:3000/cookie", {
        credentials: "same-origin",
        headers: {
          Cookie: "testCookie=Drash",
        },
      });
      await members.assertEquals(await response.text(), '"Drash"');

      // Remove - Dependent on the above post request saving a cookie
      response = await members.fetch.delete("http://localhost:3000/cookie", {
        headers: {},
      });
      cookies = response.headers.get("set-cookie") || "";
      cookieVal = cookies.split(";")[0].split("=")[1];
      members.assertEquals(cookieVal, "");
      await response.arrayBuffer();
      //await response.body.close()
    });
  });
});

Rhum.run();
