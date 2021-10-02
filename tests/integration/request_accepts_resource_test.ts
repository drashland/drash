import { Rhum, TestHelpers } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class RequestAcceptsUseCaseOneResource extends Resource {
  paths = ["/request-accepts-use-case-one"];

  public GET(request: Request, response: Response) {
    const typeToRequest = request.queryParam("typeToCheck");

    let matchedType;
    if (typeToRequest) {
      if (request.accepts(typeToRequest)) {
        matchedType = typeToRequest;
      }
    } else {
      if (request.accepts("text/html")) {
        matchedType = "text/html";
      }
    }

    if (!matchedType) {
      response.json({ success: false });
      return;
    }

    response.json(
      { success: true, message: matchedType },
    );
  }
}

class RequestAcceptsUseCaseTwoResource extends Resource {
  paths = ["/request-accepts-use-case-two"];

  public GET(request: Request, response: Response) {
    const acceptHeader = request.headers.get("Accept");
    if (!acceptHeader) {
      return this.jsonResponse(response);
    }
    const contentTypes: string[] = acceptHeader.split(";");
    for (let content of contentTypes) {
      content = content.trim();
      if (content.indexOf("application/json") != -1) {
        return this.jsonResponse(response);
      }
      if (content.indexOf("text/html") != -1) {
        return this.htmlResponse(response);
      }
      if (content.indexOf("text/xml") != -1) {
        return this.xmlResponse(response);
      }
    }
  }

  protected htmlResponse(response: Response) {
    response.html("<div>response: text/html</div>");
    return;
  }

  protected jsonResponse(response: Response) {
    response.json({ response: "application/json" });
    return;
  }

  protected xmlResponse(response: Response) {
    response.xml("<response>text/xml</response>");
  }
}

const server = new Server({
  resources: [
    RequestAcceptsUseCaseOneResource,
    RequestAcceptsUseCaseTwoResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("request_accepts_resource_test.ts", () => {
  Rhum.testSuite("/request-accepts-use-case-one", () => {
    Rhum.testCase("request accepts one type", async () => {
      server.run();
      // Accepts the correct type the resource will give - tests calling the `accepts` method with a string and finds a match
      const typeToCheck = "application/json";
      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-one?typeToCheck=" +
          typeToCheck,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const res = await response.json();
      const json = res;
      Rhum.asserts.assertEquals(json.success, true);
      Rhum.asserts.assertEquals(json.message, "application/json");

      await server.close();
    });

    Rhum.testCase(
      "request accepts multiple types: text/xml first",
      async () => {
        server.run();

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
      server.run();

      // Accepts the first content type - tests when calling the `accepts` method with an array with no match
      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-one",
        {
          headers: {
            Accept: "text/js,text/php,text/python;0.5;something", // random stuff the resource isn't looking for
          },
        },
      );
      const text = await response.text();
      Rhum.asserts.assertEquals(text.startsWith("Error: "), true);
      await server.close();
    });
  });

  Rhum.testSuite("/request-accepts-use-case-two", () => {
    Rhum.testCase("accepts one and multiple types", async () => {
      server.run();

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
