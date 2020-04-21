import members from "../tests/members.ts";
members.test("UsersResource", async () => {
  let response;

  response = await members.fetch.get("http://localhost:1667/users", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Please specify a user ID."');

  response = await members.fetch.get("http://localhost:1667/users/", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Please specify a user ID."');

  response = await members.fetch.get("http://localhost:1667/users//", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '"Not Found"');

  response = await members.fetch.get("http://localhost:1667/users/17", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '{"id":17,"name":"Thor"}');

  response = await members.fetch.get("http://localhost:1667/users/17/", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(await response.text(), '{"id":17,"name":"Thor"}');

  response = await members.fetch.get("http://localhost:1667/users/18", {
    headers: {
      token: "zeToken",
    },
  });
  members.assert.equals(
    await response.text(),
    `\"User with ID \\\"18\\\" not found.\"`,
  );
});
