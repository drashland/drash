import { assertEquals, Drash, TestHelpers } from "../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class RequestAcceptsUseCaseOneResource extends Drash.Resource {
  paths = ["/request-accepts-use-case-one"];

  public GET(request: Drash.Request) {
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
      return new Response(JSON.stringify({ success: false }), {
        headers: {
          "content-type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify(
        { success: true, message: matchedType },
      ),
      {
        headers: {
          "content-type": "application/json",
        },
      },
    );
  }
}

class RequestAcceptsUseCaseTwoResource extends Drash.Resource {
  paths = ["/request-accepts-use-case-two"];

  public GET(request: Drash.Request) {
    const acceptHeader = request.headers.get("Accept");
    if (!acceptHeader) {
      return this.jsonResponse();
    }
    const contentTypes: string[] = acceptHeader.split(";");
    for (let content of contentTypes) {
      content = content.trim();
      if (content.indexOf("application/json") != -1) {
        return this.jsonResponse();
      }

      if (request.accepts("text/html")) {
        return this.htmlResponse();
      }

      if (request.accepts("text/xml")) {
        return this.xmlResponse();
      }
    }

    return new Response("Default response");
  }

  protected htmlResponse() {
    return new Response("<div>response: text/html</div>", {
      headers: {
        "content-type": "text/html",
      },
    });
  }

  protected jsonResponse() {
    return new Response(JSON.stringify({ response: "application/json" }), {
      headers: {
        "content-type": "text/html",
      },
    });
  }

  protected xmlResponse() {
    return new Response("<response>text/xml</response>", {
      headers: {
        "content-type": "text/xml",
      },
    });
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
