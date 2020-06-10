import members from "../../members.ts";

members.testSuite("Accept header (Test suite 2)", () => {

  members.test("accepts one and multiple types", async () => {
    let response;

    response = await members.fetch.get(
      "http://localhost:3000/request-accepts-two",
      {
        headers: {
          Accept: "text/html;application/json",
        },
      },
    );
    members.assertEquals(
      await response.text(),
      `<div>response: text/html</div>`,
    );

    response = await members.fetch.get(
      "http://localhost:3000/request-accepts-two",
      {
        headers: {
          Accept: "application/json;text/xml",
        },
      },
    );
    members.assertEquals(
      await response.text(),
      `{"response":"application/json"}`,
    );

    response = await members.fetch.get(
      "http://localhost:3000/request-accepts-two",
      {
        headers: {
          Accept: "text/xml",
        },
      },
    );
    members.assertEquals(await response.text(), `<response>text/xml</response>`);
  });

});
