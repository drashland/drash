import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class OptionalPathParamsResource extends Drash.Resource {
  static paths = [
    "/oppWithoutRequired/:name?/:age_of_person?/:ci-ty?",
    "/oppWithRequired/:name/:age_of_person?",
  ];

  public GET() {
    const name = this.request.getPathParam("name");
    const age_of_person = this.request.getPathParam("age_of_person");
    const city = this.request.getPathParam("ci-ty");

    this.response.body = JSON.stringify({
      message: "Successfully handled optional path params",
      data: {
        name,
        age_of_person,
        city,
      },
    });
    return this.response;
  }
}

const server = new Drash.Server({
  resources: [
    OptionalPathParamsResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("optional_path_params_test.ts", () => {
  Rhum.testSuite("/oppWithoutRequired", () => {
    Rhum.testCase("Resource should handle request", async () => {
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);
      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
  Rhum.testSuite(
    "/oppWithoutRequired/:name/:age_of_person/:city/:other",
    () => {
      Rhum.testCase("Resource should NOT handle request", async () => {
        await TestHelpers.runServer(server);

        const response = await TestHelpers.makeRequest.get(
          "http://localhost:3000/oppWithoutRequired/edward/999/UK/other",
        );
        Rhum.asserts.assertEquals(
          await response.text(),
          '"Not Found"',
        );
        await server.close();
      });
    },
  );
  Rhum.testSuite("/oppWithoutRequired/:name/", () => {
    Rhum.testCase(
      "Resource should handle request",
      async () => {
        await TestHelpers.runServer(server);

        const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
      await TestHelpers.runServer(server);

      const response = await TestHelpers.makeRequest.get(
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
