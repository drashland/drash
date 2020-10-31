import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import OptionalPathParamsResource from "./resources/optional_path_params_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  resources: [
    OptionalPathParamsResource,
  ],
});

Rhum.testPlan("optional_path_params_test.ts", () => {
  Rhum.testSuite("/oppWithoutRequired", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, null);
      Rhum.asserts.assertEquals(json.data.age_of_person, null);
      Rhum.asserts.assertEquals(json.data.city, null);

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, null);
      Rhum.asserts.assertEquals(json.data.age_of_person, null);
      Rhum.asserts.assertEquals(json.data.city, null);

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, null);
      Rhum.asserts.assertEquals(json.data.city, null);

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, null);
      Rhum.asserts.assertEquals(json.data.city, null);

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "999");
      Rhum.asserts.assertEquals(json.data.city, null);

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "999");
      Rhum.asserts.assertEquals(json.data.city, null);

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person/:city", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/UK",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "999");
      Rhum.asserts.assertEquals(json.data.city, "UK");

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person/:city/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/UK/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "999");
      Rhum.asserts.assertEquals(json.data.city, "UK");

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person/:city/:other", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/UK/other",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );
      await server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/", () => {
    Rhum.testCase(
      "Resource should handle request",
      async () => {
        await runServer(server);

        const response = await members.fetch.get(
          "http://localhost:3000/oppWithoutRequired/edward/",
        );
        const json = JSON.parse(await response.json());
        Rhum.asserts.assertEquals(
          json.message,
          "Successfully handled optional path params",
        );
        Rhum.asserts.assertEquals(json.data.name, "edward");
        Rhum.asserts.assertEquals(json.data.age_of_person, null);
        Rhum.asserts.assertEquals(json.data.city, null);

        await server.close();
      },
    );
  });
  Rhum.testSuite("/oppWithRequired", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/edward", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, null);

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, null);

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/ed-123/22", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/ed-123/22-22",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "ed-123");
      Rhum.asserts.assertEquals(json.data.age_of_person, "22-22");

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/22/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward/22/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "22");

      await server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/22/other", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      await runServer(server);

      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward/22/other",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );

      await server.close();
    });
  });
});

Rhum.run();
