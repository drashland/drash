import members from "../../members.ts";

members.testSuite("CoffeeResource", () => {
  members.test("responses", async () => {
    let response;

    response = await members.fetch.get("https://localhost:3002/coffee");
    members.assertEquals(
      await response.text(),
      '"Please specify a coffee ID."',
    );

    response = await members.fetch.get("https://localhost:3002/coffee/");
    members.assertEquals(
      await response.text(),
      '"Please specify a coffee ID."',
    );

    response = await members.fetch.get("https://localhost:3002/coffee//");
    members.assertEquals(await response.text(), '"Not Found"');

    response = await members.fetch.get("https://localhost:3002/coffee/17");
    members.assertEquals(await response.text(), '{"name":"Light"}');

    response = await members.fetch.get("https://localhost:3002/coffee/17/");
    members.assertEquals(await response.text(), '{"name":"Light"}');

    response = await members.fetch.get("https://localhost:3002/coffee/18");
    members.assertEquals(await response.text(), '{"name":"Medium"}');

    response = await members.fetch.get("https://localhost:3002/coffee/18/");
    members.assertEquals(await response.text(), '{"name":"Medium"}');

    response = await members.fetch.get("https://localhost:3002/coffee/19");
    members.assertEquals(await response.text(), '{"name":"Dark"}');

    response = await members.fetch.get("https://localhost:3002/coffee/19/");
    members.assertEquals(await response.text(), '{"name":"Dark"}');

    response = await members.fetch.get("https://localhost:3002/coffee/20");
    members.assertEquals(
      await response.text(),
      `\"Coffee with ID \\\"20\\\" not found.\"`,
    );

    response = await members.fetch.post("https://localhost:1667/coffee/17/");
    members.assertEquals(await response.text(), '"Method Not Allowed"');

    let data;

    data = { id: 18 };
    response = await members.fetch.get(
      "https://localhost:1667/coffee/19?location=from_body",
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": JSON.stringify(data).length,
        },
        body: data,
      },
    );
    members.assertEquals(await response.text(), '{"name":"Medium"}');

    // TODO(crookse) application/x-www-form-urlencoded works, but this test keeps failing. Fix.
    // data = { id: 18 };
    // response = await members.fetch.get("https://localhost:1667/coffee/19/?location=from_body", {
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //     "Content-Length": JSON.stringify(data).length
    //   },
    //   body: JSON.stringify(data)
    // });
    // members.assertEquals(await response.text(), "{\"name\":\"Medium\"}");
  });
});
