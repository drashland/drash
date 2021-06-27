import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class CoffeeResource extends Drash.Resource {
  static paths = ["/coffee", "/coffee/:id"];

  protected coffee: { [key: string]: { name: string } } = {
    "17": {
      name: "Light",
    },
    "18": {
      name: "Medium",
    },
    "19": {
      name: "Dark",
    },
  };

  public GET() {
    let coffeeId = this.request.getPathParam("id");
    const location = this.request.getUrlQueryParam("location");

    if (location) {
      if (location == "from_body") {
        coffeeId = this.request.getBodyParam("id") as string;
      }
    }

    if (!coffeeId) {
      this.response.body = "Please specify a coffee ID.";
      return this.response;
    }

    if (coffeeId === "123") {
      return this.response.redirect(302, "/coffee/17");
    }

    this.response.body = this.getCoffee(coffeeId);
    return this.response;
  }

  protected getCoffee(coffeeId: string) {
    const coffee = this.coffee[coffeeId];

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
  response_output: "application/json",
  resources: [
    CoffeeResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("coffee_resource_test.ts (https)", () => {
  Rhum.testSuite("/coffee", () => {
    Rhum.testCase("responses", async () => {
      await TestHelpers.runServerTLS(server, { port: 3002 });
      let response;

      try {
        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee");
        Rhum.asserts.assertEquals(
          await response.text(),
          '"Please specify a coffee ID."',
        );

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee/");
        Rhum.asserts.assertEquals(
          await response.text(),
          '"Please specify a coffee ID."',
        );

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee//");
        Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee/17");
        Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee/17/");
        Rhum.asserts.assertEquals(await response.text(), '{"name":"Light"}');

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee/18");
        Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee/18/");
        Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee/19");
        Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee/19/");
        Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');

        response = await TestHelpers.makeRequest.get("https://localhost:3002/coffee/20");
        Rhum.asserts.assertEquals(
          await response.text(),
          `\"Coffee with ID \\\"20\\\" not found.\"`,
        );

        response = await TestHelpers.makeRequest.post("https://localhost:1667/coffee/17/");
        Rhum.asserts.assertEquals(await response.text(), '"Method Not Allowed"');

        let data;

        data = { id: 18 };
        response = await TestHelpers.makeRequest.get(
          "https://localhost:1667/coffee/19?location=from_body",
          {
            headers: {
              "Content-Type": "application/json",
              "Content-Length": JSON.stringify(data).length,
            },
            body: data,
          },
        );
        Rhum.asserts.assertEquals(await response.text(), '{"name":"Medium"}');

        data = "id=19";
        response = await TestHelpers.makeRequest.get(
          "https://localhost:1667/coffee/19/?location=from_body",
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
              "Content-Length": data.length + 1,
            },
            body: data,
          },
        );
        Rhum.asserts.assertEquals(await response.text(), '{"name":"Dark"}');
      } catch (error) {
        throw new Error("HTTPS test failed.");
      } finally {
        await server.close();
      }
    });
  });
});

Rhum.run();
