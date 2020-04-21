import members from "../tests/members.ts";
members.test("HomeResource", async () => {
  let response;

  response = await members.fetch.get("http://localhost:1667", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"GET request received!"');

  response = await members.fetch.get("http://localhost:1667/home", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"GET request received!"');

  response = await members.fetch.get("http://localhost:1667/home/", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"GET request received!"');

  response = await members.fetch.get("http://localhost:1667/home//", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Not Found"');

  response = await members.fetch.post("http://localhost:1667", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"POST request received!"');

  response = await members.fetch.put("http://localhost:1667", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"PUT request received!"');

  response = await members.fetch.delete("http://localhost:1667", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"DELETE request received!"');

  response = await members.fetch.patch("http://localhost:1667", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Method Not Allowed"');
});
