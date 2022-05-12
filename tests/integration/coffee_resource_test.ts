import { assertEquals, TestHelpers } from "../deps.ts";
import {
  Errors,
  IResource,
  Request,
  Resource,
  Response,
  Server,
} from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

interface ICoffee {
  name: string;
}

export class CoffeeResource extends Resource implements IResource {
  paths = ["/coffee", "/coffee/:id"];

  protected coffee = new Map<number, ICoffee>([
    [17, { name: "Light" }],
    [18, { name: "Medium" }],
    [19, { name: "Dark" }],
  ]);

  public GET(request: Request, response: Response) {
    // @ts-ignore Ignoring because we don't care
    let coffeeId: string | null | undefined = request.pathParam("id");
    const location = request.queryParam("location");
    if (location) {
      if (location == "from_query") {
        coffeeId = request.queryParam("id");
      }
    }

    if (!coffeeId) {
      response.text("Please specify a coffee ID.");
      return;
    }

    response.text(JSON.stringify(this.getCoffee(parseInt(coffeeId))));
  }

  protected getCoffee(coffeeId: number): ICoffee {
    let coffee = null;

    try {
      coffee = this.coffee.get(coffeeId);
    } catch (error) {
      throw new Errors.HttpError(
        400,
        `Error getting coffee with ID "${coffeeId}". Error: ${error.message}.`,
      );
    }

    if (!coffee) {
      throw new Errors.HttpError(
        404,
        `Coffee with ID "${coffeeId}" not found.`,
      );
    }

    return coffee as ICoffee;
  }
}

const server = new Server({
  resources: [
    CoffeeResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("coffee_resource_test.ts", async (t) => {
  await t.step("/coffee (path params)", async (t) => {
    await t.step("works as expected with path params", async () => {
      server.run();

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
        (await response.text()).startsWith(
          'Error: Coffee with ID "20" not found.',
        ),
        true,
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
        (await response.text()).startsWith("Error: Method Not Allowed"),
        true,
      );

      await server.close();
    });
  });

  await t.step("/coffee (url query params)", async (t) => {
    await t.step("works as expected with URL query params", async () => {
      server.run();

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
