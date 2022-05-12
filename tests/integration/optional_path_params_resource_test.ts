import { assertEquals, TestHelpers } from "../deps.ts";
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

Deno.test("optional_path_params_test.ts", async (t) => {
  await t.step("/oppWithoutRequired", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, undefined);
      assertEquals(json.data.age_of_person, undefined);
      assertEquals(json.data.city, undefined);

      await server.close();
    });
  });
  await t.step("/oppWithoutRequired/", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, undefined);
      assertEquals(json.data.age_of_person, undefined);
      assertEquals(json.data.city, undefined);

      await server.close();
    });
  });
  await t.step("/oppWithoutRequired/:name", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, undefined);
      assertEquals(json.data.city, undefined);

      await server.close();
    });
  });
  await t.step("/oppWithoutRequired/:name/", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, undefined);
      assertEquals(json.data.city, undefined);

      await server.close();
    });
  });
  await t.step("/oppWithoutRequired/:name/:age_of_person", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, "999");
      assertEquals(json.data.city, undefined);

      await server.close();
    });
  });
  await t.step("/oppWithoutRequired/:name/:age_of_person/", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, "999");
      assertEquals(json.data.city, undefined);

      await server.close();
    });
  });
  await t.step("/oppWithoutRequired/:name/:age_of_person/:city", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, "999");
      assertEquals(json.data.city, "UK");

      await server.close();
    });
  });
  await t.step("/oppWithoutRequired/:name/:age_of_person/:city/", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, "999");
      assertEquals(json.data.city, "UK");

      await server.close();
    });
  });
  await t.step(
    "/oppWithoutRequired/:name/:age_of_person/:city/:other",
    async (t) => {
      await t.step("Resource should NOT handle request", async () => {
        server.run();

        const response = await TestHelpers.makeRequest.get(
          "http://localhost:3000/oppWithoutRequired/edward/999/UK/other",
          {
            headers: {
              Accept: "application/json",
            },
          },
        );
        assertEquals(
          (await response.text()).startsWith("Error: Not Found"),
          true,
        );
        await server.close();
      });
    },
  );
  await t.step("/oppWithoutRequired/:name/", async (t) => {
    await t.step(
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
        assertEquals(
          json.message,
          "Successfully handled optional path params",
        );
        assertEquals(json.data.name, "edward");
        assertEquals(json.data.age_of_person, undefined);
        assertEquals(json.data.city, undefined);

        await server.close();
      },
    );
  });
  await t.step("/oppWithRequired", async (t) => {
    await t.step("Resource should NOT handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      await server.close();
    });
  });
  await t.step("/oppWithRequired/", async (t) => {
    await t.step("Resource should NOT handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      await server.close();
    });
  });
  await t.step("/oppWithRequired/edward", async (t) => {
    await t.step("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/edward",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      await server.close();
      const json = await response.json();
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, undefined);
    });
  });
  await t.step("/oppWithRequired/edward/", async (t) => {
    await t.step("Resource should handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/edward/",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      await server.close();
      const json = await response.json();
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, undefined);
    });
  });
  await t.step("/oppWithRequired/ed-123/22", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "ed-123");
      assertEquals(json.data.age_of_person, "22-22");

      await server.close();
    });
  });
  await t.step("/oppWithRequired/edward/22/", async (t) => {
    await t.step("Resource should handle request", async () => {
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
      assertEquals(
        json.message,
        "Successfully handled optional path params",
      );
      assertEquals(json.data.name, "edward");
      assertEquals(json.data.age_of_person, "22");

      await server.close();
    });
  });
  await t.step("/oppWithRequired/edward/22/other", async (t) => {
    await t.step("Resource should NOT handle request", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/oppWithRequired/edward/22/other",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      await server.close();
    });
  });
});
