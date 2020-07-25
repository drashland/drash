import members from "../../members.ts";
import { Rhum } from "../../deps.ts";

Rhum.testPlan("users_resource_test.ts", () => {
  Rhum.testSuite("/users", () => {
    Rhum.testCase("user data can be retrieved", async () => {
      let response;
      Deno.chdir("./tests/integration/app_3000_resources/resources");
      response = await members.fetch.get("http://localhost:3000/users");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a user ID."',
      );

      response = await members.fetch.get("http://localhost:3000/users/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a user ID."',
      );

      response = await members.fetch.get("http://localhost:3000/users//");
      Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

      response = await members.fetch.get("http://localhost:3000/users/17");
      Rhum.asserts.assertEquals(
        await response.text(),
        '{"id":17,"name":"Thor"}',
      );

      response = await members.fetch.get("http://localhost:3000/users/17/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '{"id":17,"name":"Thor"}',
      );

      response = await members.fetch.get("http://localhost:3000/users/18");
      Rhum.asserts.assertEquals(
        await response.text(),
        `\"User with ID \\\"18\\\" not found.\"`,
      );
    });
  });
});

Rhum.run();
