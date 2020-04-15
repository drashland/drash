import members from "../tests/members.ts";
members.test("RequestAcceptsResource", async () => {
  let response;
  let json;

  // Accepts the correct type the resource will give
  response = await members.fetch.get("http://localhost:1667/request-accepts", {
    headers: {
      "Accept": "application/json",
    },
  });
  json = JSON.parse(await response.json());
  members.assert.equals(json['success'], true);
  members.assert.equals(json.message, "Responding with the accepted content type");

  // Does not accept the type the resource expects
  response = await members.fetch.get("http://localhost:1667/request-accepts", {
    headers: {
      "Accept": "text/html",
    },
  });
  json = JSON.parse(await response.json());
  await members.assert.equals(json.success, false);
  await members.assert.equals(json.message, 'This resource only accepts JSON');
});
