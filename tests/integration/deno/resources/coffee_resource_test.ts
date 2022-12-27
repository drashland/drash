import { assertEquals, Drash, TestHelpers } from "../deps.ts";

// FILE MARKER - APP SETUP /////////////////////////////////////////////////////

interface ICoffee {
  name: string;
}

export class CoffeeResource extends Drash.Resource
  implements Drash.Interfaces.Resource {
  paths = ["/coffee", "/coffee/:id"];

  protected coffee = new Map<number, ICoffee>([
    [17, { name: "Light" }],
    [18, { name: "Medium" }],
    [19, { name: "Dark" }],
  ]);

  public GET(request: Drash.Request) {
    // @ts-ignore Ignoring because we don't care
    let coffeeId: string | null | undefined = request.pathParam("id");
    const location = request.queryParam("location");
    if (location) {
      if (location == "from_query") {
        coffeeId = request.queryParam("id");
      }
    }

    if (!coffeeId) {
      return new Response("Please specify a coffee ID.");
    }

    return new Response(JSON.stringify(this.getCoffee(parseInt(coffeeId))));
  }

  protected getCoffee(coffeeId: number): ICoffee {
    let coffee = null;

    try {
      coffee = this.coffee.get(coffeeId);
    } catch (error) {
      throw new Drash.HTTPError(
        400,
        `Error getting coffee with ID "${coffeeId}". Error: ${error.message}.`,
      );
    }

    if (!coffee) {
      throw new Drash.HTTPError(
        404,
        `Coffee with ID "${coffeeId}" not found.`,
      );
    }

    return coffee as ICoffee;
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [CoffeeResource],
  });

  const denoRequestHandler = (request: Request) => {
    return NativeRequestHandler.handle(request);
  };

  const server = new TestHelpers.DrashServer.Builder()
    .hostname("localhost")
    .port(3000)
    .handler(denoRequestHandler)
    .build();

  return server.run();
}

// FILE MARKER - TESTS /////////////////////////////////////////////////////////

Deno.test("coffee_resource_test.ts", async (t) => {
  await t.step("/coffee (path params)", async (t) => {
    await t.step("works as expected with path params", async () => {
      const server = await runServer();

      let response;

      // response = await fetch("http://localhost:3000/coffee");
      // assertEquals(
      //   await response.text(),
      //   'Please specify a coffee ID.',
      // );

      // response = await fetch("http://localhost:3000/coffee/");
      // assertEquals(
      //   await response.text(),
      //   'Please specify a coffee ID.',
      // );

      // response = await fetch("http://localhost:3000/coffee//");
      // assertEquals((await response.text()).startsWith("Error: Not Found"), true);

      // response = await fetch("http://localhost:3000/coffee/17");
      // assertEquals(await response.text(), '{"name":"Light"}');

      response = await fetch("http://localhost:3000/coffee/17/", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(await response.text(), '{"name":"Light"}');

      response = await fetch("http://localhost:3000/coffee/18", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(await response.text(), '{"name":"Medium"}');

      response = await fetch("http://localhost:3000/coffee/18/", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(await response.text(), '{"name":"Medium"}');

      response = await fetch("http://localhost:3000/coffee/19", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(await response.text(), '{"name":"Dark"}');

      response = await fetch("http://localhost:3000/coffee/19/", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(await response.text(), '{"name":"Dark"}');

      response = await fetch("http://localhost:3000/coffee/20", {
        headers: {
          Accept: "text/plain",
        },
      });
      assertEquals(
        (await response.text()).split("\n")[0],
        'Error: Coffee with ID "20" not found.',
      );

      response = await TestHelpers.makeRequest.post(
        "http://localhost:3000/coffee/17/",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      assertEquals(
        (await response.text()).split("\n")[0],
        "Error: Not Implemented",
      );

      await server.close();
    });
  });

  await t.step("/coffee (url query params)", async (t) => {
    await t.step("works as expected with URL query params", async () => {
      const server = await runServer();

      const response = await fetch(
        "http://localhost:3000/coffee/19?location=from_query&id=18",
        {
          method: "GET",
          headers: {
            Accept: "text/plain",
          },
        },
      );
      const t = await response.text();
      assertEquals(t, '{"name":"Medium"}');

      await server.close();
    });
  });
});
