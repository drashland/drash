import members from "../../members.ts";

members.testSuite("MiddlewareResource", () => {
  members.test("token header is required", async () => {
    let response;

    response = await members.fetch.get("http://localhost:3003/middleware", {
      headers: {
        "token": "zeToken",
      },
    });
    members.assertEquals(await response.text(), '"GET request received!"');

    response = await members.fetch.get("http://localhost:3003/middleware");
    members.assertEquals(await response.text(), '"No token, dude."');
  });
});
