import members from "../tests/members.ts";
members.test("CoffeeResource", async () => {
  let response;

  response = await members.fetch.get("http://localhost:1667/coffee", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Please specify a coffee ID."');

  response = await members.fetch.get("http://localhost:1667/coffee/", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Please specify a coffee ID."');

  response = await members.fetch.get("http://localhost:1667/coffee//", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Not Found"');

  response = await members.fetch.get("http://localhost:1667/coffee/17", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '{"name":"Light"}');

  response = await members.fetch.get("http://localhost:1667/coffee/17/", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '{"name":"Light"}');

  response = await members.fetch.get("http://localhost:1667/coffee/18", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '{"name":"Medium"}');

  response = await members.fetch.get("http://localhost:1667/coffee/18/", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '{"name":"Medium"}');

  response = await members.fetch.get("http://localhost:1667/coffee/19", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '{"name":"Dark"}');

  response = await members.fetch.get("http://localhost:1667/coffee/19/", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '{"name":"Dark"}');

  response = await members.fetch.get("http://localhost:1667/coffee/20", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(
    await response.text(),
    `\"Coffee with ID \\\"20\\\" not found.\"`,
  );

  response = await members.fetch.post("http://localhost:1667/coffee/17/", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Method Not Allowed"');

  let data;

  data = { id: 18 };
  response = await members.fetch.get(
    "http://localhost:1667/coffee/19?location=from_body",
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Length": JSON.stringify(data).length,
        token: "zeToken",
      },
      body: data,
    },
  );
  members.assert.equals(await response.text(), '{"name":"Medium"}');

  // TODO(crookse) application/x-www-form-urlencoded works, but this test keeps failing. Fix.
  // data = { id: 18 };
  // response = await members.fetch.get("http://localhost:1667/coffee/19/?location=from_body", {
  //   headers: {
  //     "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  //     "Content-Length": JSON.stringify(data).length
  //   },
  //   body: JSON.stringify(data)
  // });
  // members.assert.equals(await response.text(), "{\"name\":\"Medium\"}");
});
