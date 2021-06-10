import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import CoffeeResource from "./resources/coffee_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  resources: [
    CoffeeResource,
  ],
});

Rhum.testPlan("coffee_resource_test.ts", () => {
  Rhum.testSuite("/coffee (path params)", () => {
    Rhum.testCase("works as expected with path params", async () => {
      await runServer(server);

      let response;

      response = await fetch("http://localhost:3000/coffee");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a coffee ID."',
      );

      response = await fetch("http://localhost:3000/coffee/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a coffee ID."',
      );

      response = await fetch("http://localhost:3000/coffee//");
      Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

      response = await fetch("http://localhost:3000/coffee/17");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

      response = await fetch("http://localhost:3000/coffee/17/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

      response = await fetch("http://localhost:3000/coffee/18");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

      response = await fetch("http://localhost:3000/coffee/18/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

      response = await fetch("http://localhost:3000/coffee/19");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

      response = await fetch("http://localhost:3000/coffee/19/");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

      response = await fetch("http://localhost:3000/coffee/20");
      Rhum.asserts.assertEquals(
        await response.text(),
        `\"Coffee with ID \\\"20\\\" not found.\"`,
      );

      response = await members.fetch.post("http://localhost:3000/coffee/17/");
      Rhum.asserts.assertEquals(await response.text(), '"Method Not Allowed"');

      await server.close();
    });
  });

  Rhum.testSuite("/coffee (url query params)", () => {
    Rhum.testCase("works as expected with URL query params", async () => {
      await runServer(server);

      const response = await fetch(
        "http://localhost:3000/coffee/19?location=from_query&id=18",
        {
          method: "GET",
        },
      );
      const t = await response.text();
      Rhum.asserts.assertEquals(t, '{"name":"Medium"}');

      await server.close();
    });
  });
});

Rhum.run();
