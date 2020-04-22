import members from "../tests/members.ts";
members.test("RequestAcceptsTwoResource", async () => {
  let response;

  response = await members.fetch.get(
    "http://localhost:1667/request-accepts-two",
    {
      headers: {
        Accept: "text/html;application/json",
        token: "zeToken",
      },
    },
  );
  members.assert.equals(
    await response.text(),
    `<div>response: text/html</div>`,
  );

  response = await members.fetch.get(
    "http://localhost:1667/request-accepts-two",
    {
      headers: {
        Accept: "application/json;text/xml",
        token: "zeToken",
      },
    },
  );
  members.assert.equals(
    await response.text(),
    `{"response":"application/json"}`,
  );

  response = await members.fetch.get(
    "http://localhost:1667/request-accepts-two",
    {
      headers: {
        Accept: "text/xml",
        token: "zeToken",
      },
    },
  );
  members.assert.equals(await response.text(), `<response>text/xml</response>`);
});
