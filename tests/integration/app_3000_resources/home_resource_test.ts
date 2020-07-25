import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import HomeResource from "./resources/home_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  resources: [
    HomeResource,
  ],
});

Rhum.testPlan("home_resource_test.ts", () => {
  Rhum.testSuite("/", () => {
    Rhum.testCase("only defined methods are accessible", async () => {
      await runServer(server);

      let response;

      response = await members.fetch.get("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"GET request received!"',
      );

      response = await members.fetch.get("http://localhost:3000/home");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"GET request received!"',
      );

      response = await members.fetch.get("http://localhost:3000/home/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"GET request received!"',
      );

      response = await members.fetch.get("http://localhost:3000/home//");
      Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

      response = await members.fetch.post("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"POST request received!"',
      );

      response = await members.fetch.put("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"PUT request received!"',
      );

      response = await members.fetch.delete("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"DELETE request received!"',
      );

      response = await members.fetch.patch("http://localhost:3000");
      Rhum.asserts.assertEquals(await response.text(), '"Method Not Allowed"');

      await server.close();
    });
  });
});

Rhum.run();
