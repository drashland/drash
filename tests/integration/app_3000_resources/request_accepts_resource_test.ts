import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import RequestAcceptsResource from "./resources/request_accepts_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  resources: [
    RequestAcceptsResource,
  ],
});

Rhum.testPlan("request_accepts_resource_test.ts", () => {
  Rhum.testSuite("/request-accepts", () => {
    Rhum.testCase("request accepts one type", async () => {
      await runServer(server);

      let response;
      let json;
      let typeToCheck;

      // Accepts the correct type the resource will give - tests calling the `accepts` method with a string and finds a match
      typeToCheck = "application/json";
      response = await members.fetch.get(
        "http://localhost:3000/request-accepts?typeToCheck=" + typeToCheck,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(json.success, true);
      Rhum.asserts.assertEquals(json.message, "application/json");

      // Does not accept the type the resource expects - tests calling the `accepts` method with a string with no match
      response = await members.fetch.get(
        "http://localhost:3000/request-accepts?typeToCheck=" + typeToCheck,
        {
          headers: {
            Accept: "text/html",
          },
        },
      );
      json = JSON.parse(await response.json());
      await Rhum.asserts.assertEquals(json.success, false);
      Rhum.asserts.assertEquals(json.message, undefined);

      await server.close();
    });

    Rhum.testCase(
      "request accepts multiple types: text/xml first",
      async () => {
        await runServer(server);

        // Accepts the first content type - tests when calling the `accepts` method with an array and finds a match
        const response = await members.fetch.get(
          "http://localhost:3000/request-accepts",
          {
            headers: {
              Accept: "text/xml,text/html,application/json;0.5;something",
            },
          },
        );
        const json = await response.json();
        members.assertEquals(json.success, true);
        members.assertEquals(json.message, "text/html");

        await server.close();
      },
    );

    Rhum.testCase("request accepts multiple types: text/js first", async () => {
      await runServer(server);

      // Accepts the first content type - tests when calling the `accepts` method with an array with no match
      const response = await members.fetch.get(
        "http://localhost:3000/request-accepts",
        {
          headers: {
            Accept: "text/js,text/php,text/python;0.5;something", // random stuff the resource isn't looking for
          },
        },
      );
      const json = await response.json();
      members.assertEquals(json.success, false);
      members.assertEquals(json.message, undefined);

      await server.close();
    });
  });
});

Rhum.run();
