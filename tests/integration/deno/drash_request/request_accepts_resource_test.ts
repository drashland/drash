import { assertEquals, Drash, TestHelpers } from "../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class RequestAcceptsUseCaseOneResource extends Drash.Resource {
  paths = ["/request-accepts-use-case-one"];

  public GET(request: Drash.Request, response: Drash.Response) {
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
      return response.json({ success: false });
    }

    return response.json(
      { success: true, message: matchedType },
    );
  }
}

class RequestAcceptsUseCaseTwoResource extends Drash.Resource {
  paths = ["/request-accepts-use-case-two"];

  public GET(request: Drash.Request, response: Drash.Response) {
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

      if (request.accepts("text/html")) {
        return this.htmlResponse(response);
      }

      if (request.accepts("text/xml")) {
        return this.xmlResponse(response);
      }
    }

    return response.text("Default response");
  }

  protected htmlResponse(response: Drash.Response) {
    return response.html("<div>response: text/html</div>");
  }

  protected jsonResponse(response: Drash.Response) {
    return response.json({ response: "application/json" });
  }

  protected xmlResponse(response: Drash.Response) {
    return response.xml("<response>text/xml</response>");
  }
}

async function runServer(): Promise<TestHelpers.DrashServer> {
  const NativeRequestHandler = await Drash.createRequestHandler({
    resources: [
      RequestAcceptsUseCaseOneResource,
      RequestAcceptsUseCaseTwoResource,
    ],
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

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Deno.test("request_accepts_resource_test.ts", async (t) => {
  await t.step("/request-accepts-use-case-one", async (t) => {
    await t.step("request accepts one type", async () => {
      const server = await runServer();
      // Accepts the correct type the resource will give - tests calling the
      // `accepts` method with a string and finds a match
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

      assertEquals(json.success, true);
      assertEquals(json.message, "application/json");

      await server.close();
    });

    await t.step(
      "request accepts multiple types: text/xml first",
      async () => {
        const server = await runServer();

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
        assertEquals(json.success, true);
        assertEquals(json.message, "text/html");
        await server.close();
      },
    );

    await t.step("request accepts multiple types: text/js first", async () => {
      const server = await runServer();

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
      assertEquals(json.success, false);
      await server.close();
    });
  });

  await t.step("/request-accepts-use-case-two", async (t) => {
    await t.step("accepts one and multiple types", async () => {
      const server = await runServer();

      let response;

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/request-accepts-use-case-two",
        {
          headers: {
            Accept: "text/html;application/json",
          },
        },
      );
      assertEquals(
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
      assertEquals(
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
      assertEquals(
        await response.text(),
        `<response>text/xml</response>`,
      );

      await server.close();
    });
  });
});
