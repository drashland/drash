import members from "../tests/members.ts";
members.test("MiddlewareResource", async () => {
  let response;

  // Assert that passing in the token works
  response = await members.fetch.get("http://localhost:1667/middleware", {
    headers: {
      "token": "zeToken",
    },
  });
  await members.assert.equals(await response.text(), '"GET request received!"');

  // Assert that not passing in the token doesn't work
  response = await members.fetch.get("http://localhost:1667/middleware");
  await members.assert.equals(await response.text(), '"No token, dude."');
});
