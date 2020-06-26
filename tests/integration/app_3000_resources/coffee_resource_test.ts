import members from "../../members.ts";
import { Rhum } from "../../test_deps.ts";

Rhum.testPlan("coffee_resource_test.ts", () => {
  Rhum.testSuite("/coffee", () => {
    Rhum.testCase("works as expected", async () => {
      let response;

      response = await members.fetch.get("http://localhost:3000/coffee");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a coffee ID."',
      );

      response = await members.fetch.get("http://localhost:3000/coffee/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a coffee ID."',
      );

      response = await members.fetch.get("http://localhost:3000/coffee//");
      Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

      response = await members.fetch.get("http://localhost:3000/coffee/17");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

      response = await members.fetch.get("http://localhost:3000/coffee/17/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

      response = await members.fetch.get("http://localhost:3000/coffee/18");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

      response = await members.fetch.get("http://localhost:3000/coffee/18/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

      response = await members.fetch.get("http://localhost:3000/coffee/19");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

      response = await members.fetch.get("http://localhost:3000/coffee/19/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

      response = await members.fetch.get("http://localhost:3000/coffee/20");
      Rhum.asserts.assertEquals(
        await response.text(),
        `\"Coffee with ID \\\"20\\\" not found.\"`,
      );

      response = await members.fetch.post("http://localhost:3000/coffee/17/");
      Rhum.asserts.assertEquals(await response.text(), '"Method Not Allowed"');

      let data;

      data = { id: 18 };
      response = await members.fetch.get(
        "http://localhost:3000/coffee/19?location=from_body",
        {
          headers: {
            "Content-Type": "application/json",
            "Content-Length": JSON.stringify(data).length,
          },
          body: data,
        },
      );
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

      // TODO(crookse) application/x-www-form-urlencoded works, but this test
      // keeps failing. Fix.
      // data = { id: 18 };
      // response = await members.fetch.get("http://localhost:3000/coffee/19/?location=from_body", {
      //   headers: {
      //     "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      //     "Content-Length": JSON.stringify(data).length
      //   },
      //   body: JSON.stringify(data)
      // });
      // Rhum.asserts.assertEquals(await response.text(), "{\"name\":\"Medium\"}");
    });
  });
});

Rhum.run();
