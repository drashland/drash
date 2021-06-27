import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

interface ICoffee {
  name: string;
}

export class CoffeeResource extends Drash.Resource {
  static paths = ["/coffee", "/coffee/:id"];

  protected coffee = new Map<number, ICoffee>([
    [17, { name: "Light" }],
    [18, { name: "Medium" }],
    [19, { name: "Dark" }],
  ]);

  public GET() {
    // @ts-ignore Ignoring because we don't care
    let coffeeId: any = this.request.getPathParam("id");
    const location = this.request.getUrlQueryParam("location");
    if (location) {
      if (location == "from_query") {
        coffeeId = this.request.getUrlQueryParam("id");
      }
    }

    if (!coffeeId) {
      this.response.body = "Please specify a coffee ID.";
      return this.response;
    }

    if (coffeeId === "123") {
      return this.response.redirect(302, "/coffee/17");
    }

    this.response.body = this.getCoffee(parseInt(coffeeId));
    return this.response;
  }

  protected getCoffee(coffeeId: number) {
    let coffee = null;

    try {
      coffee = this.coffee.get(coffeeId);
    } catch (error) {
      throw new Drash.HttpError(
        400,
        `Error getting coffee with ID "${coffeeId}". Error: ${error.message}.`,
      );
    }

    if (!coffee) {
      throw new Drash.HttpError(
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
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("coffee_resource_test.ts", () => {
  Rhum.testSuite("/coffee (path params)", () => {
    Rhum.testCase("works as expected with path params", async () => {
      await TestHelpers.runServer(server);

      let response;

      response = await fetch("http://localhost:3000/coffee");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a coffee ID."',
      );

      response = await fetch("http://localhost:3000/coffee/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"Please specify a coffee ID."',
      );

      response = await fetch("http://localhost:3000/coffee//");
      Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

      response = await fetch("http://localhost:3000/coffee/17");
      Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

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
        await response.text(),
        `\"Coffee with ID \\\"20\\\" not found.\"`,
      );

      response = await TestHelpers.makeRequest.post("http://localhost:3000/coffee/17/");
      Rhum.asserts.assertEquals(await response.text(), '"Method Not Allowed"');

      await server.close();
    });
  });

  Rhum.testSuite("/coffee (url query params)", () => {
    Rhum.testCase("works as expected with URL query params", async () => {
      await TestHelpers.runServer(server);

      const response = await fetch(
        "http://localhost:3000/coffee/19?location=from_query&id=18",
        {
          method: "GET",
        },
      );
      const t = await response.text();
      Rhum.asserts.assertEquals(t, '{"name":"Medium"}');

      await server.close();
    });
  });
});

Rhum.run();
