import members from "../tests/members.ts";
members.test("RequestAcceptsResource", async () => {
  let response;
  let json;
  let typeToCheck;

  // Accepts the correct type the resource will give - tests calling the `accepts` method with a string and finds a match
  typeToCheck = "application/json";
  response = await members.fetch.get(
    "http://localhost:1667/request-accepts?typeToCheck=" + typeToCheck,
    {
      headers: {
        Accept: "application/json",
        token: "zeToken",
      },
    },
  );
  json = JSON.parse(await response.json());
  members.assert.equals(json.success, true);
  members.assert.equals(json.message, "application/json");

  // Does not accept the type the resource expects - tests calling the `accepts` method with a string with no match
  response = await members.fetch.get(
    "http://localhost:1667/request-accepts?typeToCheck=" + typeToCheck,
    {
      headers: {
        Accept: "text/html",
        token: "zeToken",
      },
    },
  );
  json = JSON.parse(await response.json());
  await members.assert.equals(json.success, false);
  members.assert.equals(json.message, undefined);

  // Accepts the first content type - tests when calling the `accepts` method with an array and finds a match
  response = await members.fetch.get("http://localhost:1667/request-accepts", {
    headers: {
      Accept: "text/xml,text/html,application/json;0.5;something",
      token: "zeToken",
    },
  });
  json = JSON.parse(await response.json());
  members.assert.equals(json.success, true);
  members.assert.equals(json.message, "text/html");

  // Accepts the first content type - tests when calling the `accepts` method with an array with no match
  response = await members.fetch.get("http://localhost:1667/request-accepts", {
    headers: {
      Accept: "text/js,text/php,text/python;0.5;something", // random stuff the resource isn't looking for
      token: "zeToken",
    },
  });
  json = JSON.parse(await response.json());
  members.assert.equals(json.success, false);
  members.assert.equals(json.message, undefined);
});
