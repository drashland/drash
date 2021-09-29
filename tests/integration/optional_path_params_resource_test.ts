import { Rhum, TestHelpers } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class OptionalPathParamsResource extends Resource {
  paths = [
    "/oppWithoutRequired/:name?/:age_of_person?/:city?",
    "/oppWithRequired/:name/:age_of_person?",
  ];

  public GET(request: Request, response: Response) {
    const name = request.pathParam("name");
    // deno-lint-ignore camelcase
    const age_of_person = request.pathParam("age_of_person");
    const city = request.pathParam("city");

    response.json({
      message: "Successfully handled optional path params",
      data: {
        name,
        age_of_person,
        city,
      },
    });
  }
}

const server = new Server({
  resources: [
    OptionalPathParamsResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("optional_path_params_test.ts", () => {
  Rhum.testSuite("/oppWithoutRequired", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithoutRequired",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, undefined);
      Rhum.asserts.assertEquals(json.data.age_of_person, undefined);
      Rhum.asserts.assertEquals(json.data.city, undefined);

      server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithoutRequired/",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, undefined);
      Rhum.asserts.assertEquals(json.data.age_of_person, undefined);
      Rhum.asserts.assertEquals(json.data.city, undefined);

      server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithoutRequired/edward",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, undefined);
      Rhum.asserts.assertEquals(json.data.city, undefined);

      server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithoutRequired/edward/",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, undefined);
      Rhum.asserts.assertEquals(json.data.city, undefined);

      server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithoutRequired/edward/999",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "999");
      Rhum.asserts.assertEquals(json.data.city, undefined);

      server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "999");
      Rhum.asserts.assertEquals(json.data.city, undefined);

      server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person/:city", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();
      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/UK",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "999");
      Rhum.asserts.assertEquals(json.data.city, "UK");

      server.close();
    });
  });
  Rhum.testSuite("/oppWithoutRequired/:name/:age_of_person/:city/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithoutRequired/edward/999/UK/",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "999");
      Rhum.asserts.assertEquals(json.data.city, "UK");

      server.close();
    });
  });
  Rhum.testSuite(
    "/oppWithoutRequired/:name/:age_of_person/:city/:other",
    () => {
      Rhum.testCase("Resource should NOT handle request", async () => {
        server.run();

        const response = await TestHelpers.makeRequest.get(
          "http://localhost:3000/oppWithoutRequired/edward/999/UK/other",
          {
            headers: {
              Accept: "application/json",
            },
          },
        );
        Rhum.asserts.assertEquals(
          (await response.text()).startsWith("Error: Not Found"),
          true,
        );
        server.close();
      });
    },
  );
  Rhum.testSuite("/oppWithoutRequired/:name/", () => {
    Rhum.testCase(
      "Resource should handle request",
      async () => {
        server.run();

        const response = await TestHelpers.makeRequest.get(
          "http://localhost:3000/oppWithoutRequired/edward/",
          {
            headers: {
              Accept: "application/json",
            },
          },
        );
        const json = await response.json();
        Rhum.asserts.assertEquals(
          json.message,
          "Successfully handled optional path params",
        );
        Rhum.asserts.assertEquals(json.data.name, "edward");
        Rhum.asserts.assertEquals(json.data.age_of_person, undefined);
        Rhum.asserts.assertEquals(json.data.city, undefined);

        server.close();
      },
    );
  });
  Rhum.testSuite("/oppWithRequired", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      Rhum.asserts.assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      Rhum.asserts.assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/edward", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/edward",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, undefined);

      server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/edward",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, undefined);

      server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/ed-123/22", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/ed-123/22-22",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "ed-123");
      Rhum.asserts.assertEquals(json.data.age_of_person, "22-22");

      server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/22/", () => {
    Rhum.testCase("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/edward/22/",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      Rhum.asserts.assertEquals(json.data.name, "edward");
      Rhum.asserts.assertEquals(json.data.age_of_person, "22");

      server.close();
    });
  });
  Rhum.testSuite("/oppWithRequired/edward/22/other", () => {
    Rhum.testCase("Resource should NOT handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/edward/22/other",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      Rhum.asserts.assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      server.close();
    });
  });
});

Rhum.run();
