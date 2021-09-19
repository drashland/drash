import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

interface ICoffee {
  name: string;
}

export class CoffeeResource extends Drash.DrashResource implements Drash.Interfaces.IResource {
  static paths = ["/coffee", "/coffee/:id"];

  protected coffee = new Map<number, ICoffee>([
    [17, { name: "Light" }],
    [18, { name: "Medium" }],
    [19, { name: "Dark" }],
  ]);

  public GET(context: Drash.Interfaces.Context) {
    // @ts-ignore Ignoring because we don't care
    let coffeeId: string | null | undefined = context.request.pathParam("id");
    const location = context.request.queryParam("location");
    if (location) {
      if (location == "from_query") {
        coffeeId = context.request.queryParam("id");
      }
    }

    if (!coffeeId) {
      context.response.body = "Please specify a coffee ID.";
      return;
    }

    if (coffeeId === "123") {
      context.response.headers.set('Location', '/coffee/17')
      context.response.status = 302
      return;
    }

    context.response.body = JSON.stringify(this.getCoffee(parseInt(coffeeId)));
  }

  protected getCoffee(coffeeId: number) {
    let coffee = null;

    try {
      coffee = this.coffee.get(coffeeId);
    } catch (error) {
      throw new Drash.Errors.HttpError(
        400,
        `Error getting coffee with ID "${coffeeId}". Error: ${error.message}.`,
      );
    }

    if (!coffee) {
      throw new Drash.Errors.HttpError(
        404,
        `Coffee with ID "${coffeeId}" not found.`,
      );
    }

    return coffee;
  }
}

const server = new Drash.Server({
  resources: [
    CoffeeResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("coffee_resource_test.ts", () => {
  Rhum.testSuite("/coffee (path params)", () => {
    Rhum.testCase("works as expected with path params", async () => {
      server.run();

      let response;

      // response = await fetch("http://localhost:3000/coffee");
      // Rhum.asserts.assertEquals(
      //   await response.text(),
      //   'Please specify a coffee ID.',
      // );

      // response = await fetch("http://localhost:3000/coffee/");
      // Rhum.asserts.assertEquals(
      //   await response.text(),
      //   'Please specify a coffee ID.',
      // );

      // response = await fetch("http://localhost:3000/coffee//");
      // Rhum.asserts.assertEquals((await response.text()).startsWith("Error: Not Found"), true);

      // response = await fetch("http://localhost:3000/coffee/17");
      // Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

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
        (await response.text()).startsWith("Error: Coffee with ID \"20\" not found."),
        true,
      );

      response = await TestHelpers.makeRequest.post(
        "http://localhost:3000/coffee/17/",
      );
      Rhum.asserts.assertEquals((await response.text()).startsWith("Error: Method Not Allowed"), true);

      server.close();
    });
  });

  Rhum.testSuite("/coffee (url query params)", () => {
    Rhum.testCase("works as expected with URL query params", async () => {
      server.run();

      const response = await fetch(
        "http://localhost:3000/coffee/19?location=from_query&id=18",
        {
          method: "GET",
        },
      );
      const t = await response.text();
      Rhum.asserts.assertEquals(t, '{"name":"Medium"}');

      server.close();
    });
  });
});

Rhum.run();
