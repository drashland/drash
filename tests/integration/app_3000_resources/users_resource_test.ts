import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import {Drash} from "../../../mod.ts";
import UsersResource from "./resources/users_resource.ts";
import {runServer} from "../test_utils.ts";

const server = new Drash.Http.Server({
  resources: [
    UsersResource,
  ],
});

Rhum.testPlan("users_resource_test.ts", () => {
  Rhum.testSuite("/users", () => {
    Rhum.testCase("user data can be retrieved", async () => {
      await runServer(server)

      let response;
      Deno.chdir("./tests/integration/app_3000_resources/resources");
      response = await members.fetch.get("http://localhost:3000/users");
      members.assertEquals(
        await response.text(),
        '"Please specify a user ID."',
      );

      response = await members.fetch.get("http://localhost:3000/users/");
      members.assertEquals(
        await response.text(),
        '"Please specify a user ID."',
      );

      response = await members.fetch.get("http://localhost:3000/users//");
      members.assertEquals(await response.text(), '"Not Found"');

      response = await members.fetch.get("http://localhost:3000/users/17");
      members.assertEquals(await response.text(), '{"id":17,"name":"Thor"}');

      response = await members.fetch.get("http://localhost:3000/users/17/");
      members.assertEquals(await response.text(), '{"id":17,"name":"Thor"}');

      response = await members.fetch.get("http://localhost:3000/users/18");
      members.assertEquals(
        await response.text(),
        `\"User with ID \\\"18\\\" not found.\"`,
      );

      await server.close()
    });
  });
});

Rhum.run();
