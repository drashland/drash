import members from "../../members.ts";
import { Rhum } from "../../deps.ts";

Rhum.testPlan("optional_path_params_test.ts", () => {
  Rhum.testSuite("/person", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      const response = await members.fetch.get("http://localhost:3000/person");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );
    });
  });
  Rhum.testSuite("/person/", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      const response = await members.fetch.get("http://localhost:3000/person/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );
    });
  });
  Rhum.testSuite("/person/:name", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/person/edward",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, null);
      Rhum.asserts.assertEquals(json.data.city, null);
    });
  });
  Rhum.testSuite("/person/:name/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/person/edward/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, null);
      Rhum.asserts.assertEquals(json.data.city, null);
    });
  });
  Rhum.testSuite("/person/:name/:age", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/person/edward/999",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, "999");
      Rhum.asserts.assertEquals(json.data.city, null);
    });
  });
  Rhum.testSuite("/person/:name/:age/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/person/edward/999/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, "999");
      Rhum.asserts.assertEquals(json.data.city, null);
    });
  });
  Rhum.testSuite("/person/:name/:age/:city", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/person/edward/999/UK",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, "999");
      Rhum.asserts.assertEquals(json.data.city, "UK");
    });
  });
  Rhum.testSuite("/person/:name/:age/:city/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/person/edward/999/UK/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, "999");
      Rhum.asserts.assertEquals(json.data.city, "UK");
    });
  });
  Rhum.testSuite("/person/:name/:age/:city/:other", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/person/edward/999/UK/other",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );
    });
  });
  Rhum.testSuite("/person/:name/", () => {
    Rhum.testCase(
      "Resource should handle request when ending with a '/'",
      async () => {
        const response = await members.fetch.get(
          "http://localhost:3000/person/edward/",
        );
        const json = JSON.parse(await response.json());
        Rhum.asserts.assertEquals(
          json.message,
          "Successfully handled optional path params",
        );
        Rhum.asserts.assertEquals(json.data.name, "edward");
        Rhum.asserts.assertEquals(json.data.age, null);
        Rhum.asserts.assertEquals(json.data.city, null);
      },
    );
  });
});

Rhum.run();
