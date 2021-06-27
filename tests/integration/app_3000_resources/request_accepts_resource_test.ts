import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class RequestAcceptsUseCaseOneResource extends Drash.Resource {
  static paths = ["/request-accepts-use-case-one"];

  public GET() {
    const typeToRequest = this.request.getUrlQueryParam("typeToCheck");

    let matchedType;
    if (typeToRequest) {
      matchedType = this.request.accepts(typeToRequest);
    } else {
      matchedType = this.request.accepts(["text/html", "application/json"]);
    }

    if (!matchedType) {
      this.response.body = JSON.stringify({ success: false });
      return this.response;
    }

    this.response.body = JSON.stringify(
      { success: true, message: matchedType },
    );

    return this.response;
  }
}

class RequestAcceptsUseCaseTwoResource extends Drash.Resource {
  static paths = ["/request-accepts-use-case-two"];

  public GET() {
    const acceptHeader = this.request.headers.get("Accept");
    if (!acceptHeader) {
      return this.jsonResponse();
    }
    let contentTypes: string[] = acceptHeader.split(";");
    for (let content of contentTypes) {
      content = content.trim();
      if (content.indexOf("application/json") != -1) {
        return this.jsonResponse();
      }
      if (content.indexOf("text/html") != -1) {
        return this.htmlResponse();
      }
      if (content.indexOf("text/xml") != -1) {
        return this.xmlResponse();
      }
    }
  }

  protected htmlResponse(): Drash.Response {
    this.response.headers.set("Content-Type", "text/html");
    this.response.body = "<div>response: text/html</div>";
    return this.response;
  }

  protected jsonResponse(): Drash.Response {
    this.response.headers.set("Content-Type", "application/json");
    this.response.body = { response: "application/json" };
    return this.response;
  }

  protected xmlResponse(): Drash.Response {
    this.response.headers.set("Content-Type", "text/xml");
    this.response.body = "<response>text/xml</response>";
    return this.response;
  }
}

const server = new Drash.Server({
  resources: [
    RequestAcceptsUseCaseOneResource,
    RequestAcceptsUseCaseTwoResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("request_accepts_resource_test.ts", () => {
  Rhum.testSuite("/request-accepts-use-case-one", () => {
    Rhum.testCase("request accepts one type", async () => {
      await TestHelpers.runServer(server);

      let response;
      let json;
      let typeToCheck;

      // Accepts the correct type the resource will give - tests calling the `accepts` method with a string and finds a match
      typeToCheck = "application/json";
      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-one?typeToCheck=" +
          typeToCheck,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      let res = await response.json();
      json = JSON.parse(res);
      Rhum.asserts.assertEquals(json.success, true);
      Rhum.asserts.assertEquals(json.message, "application/json");

      // Does not accept the type the resource expects - tests calling the `accepts` method with a string with no match
      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-one?typeToCheck=" +
          typeToCheck,
        {
          headers: {
            Accept: "text/html",
          },
        },
      );
      res = await response.json();
      json = JSON.parse(res);
      await Rhum.asserts.assertEquals(json.success, false);
      Rhum.asserts.assertEquals(json.message, undefined);

      await server.close();
    });

    Rhum.testCase(
      "request accepts multiple types: text/xml first",
      async () => {
        await TestHelpers.runServer(server);

        // Accepts the first content type - tests when calling the `accepts` method with an array and finds a match
        const response = await TestHelpers.makeRequest.get(
          "http://localhost:3000/request-accepts-use-case-one",
          {
            headers: {
              Accept: "text/xml,text/html,application/json;0.5;something",
            },
          },
        );
        const json = await response.json();
        Rhum.asserts.assertEquals(json.success, true);
        Rhum.asserts.assertEquals(json.message, "text/html");
        await server.close();
      },
    );

    Rhum.testCase("request accepts multiple types: text/js first", async () => {
      await TestHelpers.runServer(server);

      // Accepts the first content type - tests when calling the `accepts` method with an array with no match
      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-one",
        {
          headers: {
            Accept: "text/js,text/php,text/python;0.5;something", // random stuff the resource isn't looking for
          },
        },
      );
      const json = await response.json();
      Rhum.asserts.assertEquals(json.success, false);
      Rhum.asserts.assertEquals(json.message, undefined);
      await server.close();
    });
  });

  Rhum.testSuite("/request-accepts-use-case-two", () => {
    Rhum.testCase("accepts one and multiple types", async () => {
      await TestHelpers.runServer(server);

      let response;

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-two",
        {
          headers: {
            Accept: "text/html;application/json",
          },
        },
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        `<div>response: text/html</div>`,
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-two",
        {
          headers: {
            Accept: "application/json;text/xml",
          },
        },
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        `{"response":"application/json"}`,
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-two",
        {
          headers: {
            Accept: "text/xml",
          },
        },
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        `<response>text/xml</response>`,
      );

      await server.close();
    });
  });
});

Rhum.run();
