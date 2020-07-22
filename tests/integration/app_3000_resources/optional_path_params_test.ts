import members from "../../members.ts";
import { Rhum } from "../../deps.ts";

Rhum.testPlan("optional_path_params_test.ts", () => {
  Rhum.testSuite("/oppWithoutRequired", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, null);
      Rhum.asserts.assertEquals(json.data.age, null);
      Rhum.asserts.assertEquals(json.data.city, null);
    });
  });
  Rhum.testSuite("/oppWithoutRequired/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, null);
      Rhum.asserts.assertEquals(json.data.age, null);
      Rhum.asserts.assertEquals(json.data.city, null);
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward",
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
  Rhum.testSuite("/oppWithoutRequired/:name/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/",
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
  Rhum.testSuite("/oppWithoutRequired/:name/:age", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999",
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
  Rhum.testSuite("/oppWithoutRequired/:name/:age/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/",
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
  Rhum.testSuite("/oppWithoutRequired/:name/:age/:city", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/UK",
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
  Rhum.testSuite("/oppWithoutRequired/:name/:age/:city/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/UK/",
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
  Rhum.testSuite("/oppWithoutRequired/:name/:age/:city/:other", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/UK/other",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/", () => {
    Rhum.testCase(
      "Resource should handle request",
      async () => {
        const response = await members.fetch.get(
          "http://localhost:3000/oppWithoutRequired/edward/",
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
  Rhum.testSuite("/oppWithRequired", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );
    });
  });
  Rhum.testSuite("/oppWithRequired/", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );
    });
  });
  Rhum.testSuite("/oppWithRequired/edward", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, null);
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, null);
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/22", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward/22",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, "22");
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/22/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward/22/",
      );
      const json = JSON.parse(await response.json());
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age, "22");
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/22/other", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      const response = await members.fetch.get(
        "http://localhost:3000/oppWithRequired/edward/22/other",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Not Found"',
      );
    });
  });
});

Rhum.run();
