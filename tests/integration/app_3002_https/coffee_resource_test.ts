import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import {Drash} from "../../../mod.ts";
import CoffeeResource from "./resources/coffee_resource.ts";
import {runServerTLS} from "../test_utils.ts";

const server = new Drash.Http.Server({
  response_output: "application/json",
  resources: [
    CoffeeResource,
  ],
});

Rhum.testPlan("coffee_resource_test.ts (https)", () => {
  Rhum.testSuite("/coffee", () => {
    Rhum.testCase("responses", async () => {
      await runServerTLS(server, { port: 3002 })
      let response;

      response = await members.fetch.get("https://localhost:3002/coffee");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a coffee ID."',
      );

      response = await members.fetch.get("https://localhost:3002/coffee/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a coffee ID."',
      );

      response = await members.fetch.get("https://localhost:3002/coffee//");
      Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

      response = await members.fetch.get("https://localhost:3002/coffee/17");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

      response = await members.fetch.get("https://localhost:3002/coffee/17/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

      response = await members.fetch.get("https://localhost:3002/coffee/18");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

      response = await members.fetch.get("https://localhost:3002/coffee/18/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

      response = await members.fetch.get("https://localhost:3002/coffee/19");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

      response = await members.fetch.get("https://localhost:3002/coffee/19/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

      response = await members.fetch.get("https://localhost:3002/coffee/20");
      Rhum.asserts.assertEquals(
        await response.text(),
        `\"Coffee with ID \\\"20\\\" not found.\"`,
      );

      response = await members.fetch.post("https://localhost:1667/coffee/17/");
      Rhum.asserts.assertEquals(await response.text(), '"Method Not Allowed"');

      let data;

      data = { id: 18 };
      response = await members.fetch.get(
        "https://localhost:1667/coffee/19?location=from_body",
        {
          headers: {
            "Content-Type": "application/json",
            "Content-Length": JSON.stringify(data).length,
          },
          body: data,
        },
      );
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

      data = "id=19";
      response = await members.fetch.get(
        "https://localhost:1667/coffee/19/?location=from_body",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "Content-Length": data.length + 1,
          },
          body: data,
        },
      );
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

      await server.close()
    });
  });
});

Rhum.run();
