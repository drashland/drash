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

      server.close();
    });
  });

  // Rhum.testSuite("/coffee (url query params)", () => {
  //   Rhum.testCase("works as expected with URL query params", async () => {
  //     await runServer(server);

  //     let response;

  //     let data1 = { id: 18 };
  //     const headers1 = new Headers();
  //     headers1.set("Content-Type", "application/json")
  //     headers1.set("Content-Length",  JSON.stringify(data1).length.toString())

  //     response = await fetch(new Request(
  //       "http://localhost:3000/coffee/19?location=from_body",
  //       {
  //         headers: headers1,
  //         body: JSON.stringify(data1),
  //       },
  //     ));
  //     Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

  //     let data2 = "id=19";
  //     const headers2 = new Headers();
  //     headers2.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
  //     headers2.set("Content-Length", (data2.length + 1).toString());
  //     response = await fetch(new Request(
  //       "http://localhost:3000/coffee/19/?location=from_body",
  //       {
  //         headers: headers2,
  //         body: data2,
  //       },
  //     ));
  //     Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

  //     await server.close();
  //   });
  // });
});

Rhum.run();
