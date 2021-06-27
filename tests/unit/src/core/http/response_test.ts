import { Drash, Rhum, TestHelpers } from "../../../../deps.ts";
const decoder = new TextDecoder();

Rhum.testPlan("http/response_test.ts", () => {
  Rhum.testSuite("constructor()", () => {
    Rhum.testCase(
      "Uses the passed in default response output for headers",
      () => {
        const request = TestHelpers.mockRequest("/", "get", {
          headers: {
            "Accept": "something else",
          },
        });
        const response = new Drash.Response(request, {
          default_content_type: "application/json",
        });
        Rhum.asserts.assertEquals(
          response.headers.get("Content-Type"),
          "application/json",
        );
      },
    );
    Rhum.testCase(
      "Uses Accept header for setting the ContentType header when no config",
      () => {
        const request = TestHelpers.mockRequest("/", "get");
        const response = new Drash.Response(request);
        Rhum.asserts.assertEquals(
          response.headers.get("Content-Type"),
          "application/json",
        );
      },
    );
  });

  Rhum.testSuite("render()", () => {
    Rhum.testCase("Returns false by default", () => {
      const request = TestHelpers.mockRequest("/");
      const Response = new Drash.Response(request);
      const result = Response.render("/users/index.html");
      Rhum.asserts.assertEquals(result, false);
    });
  });

  Rhum.testSuite("setCookie()", () => {
    Rhum.testCase("Successfully sets a cookie", () => {
      const request = TestHelpers.mockRequest("/");
      const Response = new Drash.Response(request);
      Response.setCookie({
        name: "Framework",
        value: "Drash",
      });
      Rhum.asserts.assertEquals(
        Response.headers!.get("set-cookie"),
        "Framework=Drash",
      );
    });
  });

  Rhum.testSuite("delCookie()", () => {
    Rhum.testCase("Successfully deletes a cookie", () => {
      const request = TestHelpers.mockRequest("/");
      const Response = new Drash.Response(request);
      Response.setCookie({
        name: "Framework",
        value: "Drash",
      });
      Rhum.asserts.assertEquals(
        Response.headers!.get("Set-Cookie"),
        "Framework=Drash",
      );
      Response.delCookie("Framework");
      // Before 0552eaf569ef910b0d132b6e60758f17a4519d91, the dataAppend function replaces the cookie key if it already exists.
      // But after that, it seems that it will only be appended to the back.
      // [1]: https://github.com/denoland/deno/blob/0552eaf569ef910b0d132b6e60758f17a4519d91/op_crates/fetch/20_headers.js#L74
      Rhum.asserts.assertEquals(
        Response.headers!.get("Set-Cookie"),
        "Framework=Drash, Framework=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      );
    });
  });

  Rhum.testSuite("generateResponse()", () => {
    Rhum.testCase("Responds with a JSON string with application/json", () => {
      let request = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const Response = new Drash.Response(request);
      Response.body = {
        name: "Drash",
      };
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, '{"name":"Drash"}');
    });

    Rhum.testCase("Responds with the same body for text/html", () => {
      let request = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "text/html",
        },
      });
      const Response = new Drash.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, '"Hello world!"');
    });

    Rhum.testCase("Responds with the same body for application/xml", () => {
      let request = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/xml",
        },
      });
      const Response = new Drash.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, '"Hello world!"');
    });

    Rhum.testCase("Responds with the same body for text/plain", () => {
      let request = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "text/plain",
        },
      });
      const Response = new Drash.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, '"Hello world!"');
    });

    Rhum.testCase("Responds with the same body for text/xml", () => {
      let request = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "text/xml",
        },
      });
      const Response = new Drash.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, '"Hello world!"');
    });

    Rhum.testCase(
      "Responds with the same body for binary",
      () => {
        let request = TestHelpers.mockRequest("/", "get", {
          headers: {
            "Content-Type": "image/png",
          },
        });
        const data = new Uint8Array([1, 2, 3]);
        const Response = new Drash.Response(request);
        Response.headers.set("Content-Type", "image/png");
        Response.body = data;
        const body = Response.generateResponse();
        console.log(typeof body);
        Rhum.asserts.assertEquals(body, data);
      },
    );

    Rhum.testCase("Responds with the same body for any other types", () => {
      let request = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "something/orOther",
        },
      });
      const Response = new Drash.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, '"Hello world!"');
    });

    Rhum.testCase(
      'Responds with "null" when body is null with no content type',
      () => {
        let request = TestHelpers.mockRequest("/", "get", {
          headers: {
            "Content-Type": "something/orOther",
          },
        });
        const Response = new Drash.Response(request);
        Response.body = null;
        Response.headers.set("Content-Type", "something/orOther");
        const body = Response.generateResponse();
        Rhum.asserts.assertEquals(body, "null");
      },
    );

    Rhum.testCase(
      'Responds with "undefined" when body is undefined with no content type',
      () => {
        let request = TestHelpers.mockRequest("/", "get", {
          headers: {
            "Content-Type": "something/orOther",
          },
        });
        const Response = new Drash.Response(request);
        Response.headers.set("Content-Type", "something/orOther");
        Response.body = undefined;
        const body = Response.generateResponse();
        Rhum.asserts.assertEquals(body, "undefined");
      },
    );

    Rhum.testCase(
      'Responds with "false" when body is false with no content type',
      () => {
        let request = TestHelpers.mockRequest("/", "get", {
          headers: {
            "Content-Type": "something/orOther",
          },
        });
        const Response = new Drash.Response(request);
        Response.body = false;
        Response.headers.set("Content-Type", "something/orOther");
        const body = Response.generateResponse();
        Rhum.asserts.assertEquals(body, "false");
      },
    );

    Rhum.testCase(
      'Responds with "true" when body is true with no content type',
      () => {
        let request = TestHelpers.mockRequest("/", "get", {
          headers: {
            "Content-Type": "something/orOther",
          },
        });
        const Response = new Drash.Response(request);
        Response.body = true;
        Response.headers.set("Content-Type", "something/orOther");
        const body = Response.generateResponse();
        Rhum.asserts.assertEquals(body, "true");
      },
    );

    Rhum.testCase(
      'Responds with "null" when body is not a string/undefined/null/bool',
      () => {
        let request = TestHelpers.mockRequest("/", "get", {
          headers: {
            "Content-Type": "something/orOther",
          },
        });
        const Response = new Drash.Response(request);
        Response.headers.set("Content-Type", "something/orOther");
        Response.body = {
          name: "Tests are boring to write, but they are really good to have",
        };
        const body = Response.generateResponse();
        Rhum.asserts.assertEquals(body, "null");
      },
    );
  });

  // NOTE: Ignoring assertions for the correct message on status codes, because
  // the method gets the message from std/http - which would mean we are testing Deno's code
  // The only implementation we have is if there is no message then return null
  Rhum.testSuite("getStatusMessage()", () => {
    Rhum.testCase(
      "Returns null if there is no message for the status code",
      () => {
        const request = TestHelpers.mockRequest("/");
        const Response = new Drash.Response(request);
        Response.status_code = 9999;
        const statusMessage = Response.getStatusMessage();
        Rhum.asserts.assertEquals(statusMessage, null);
      },
    );

    Rhum.testCase("Returns a valid message for a valid code", () => {
      const request = TestHelpers.mockRequest("/");
      const Response = new Drash.Response(request);
      Response.status_code = 404;
      const statusMessage = Response.getStatusMessage();
      Rhum.asserts.assertEquals(statusMessage, "Not Found");
    });
  });

  // NOTE: Ignoring assertions for the correct message on status codes, because
  // the method gets the message from std/http - which would mean we are testing Deno's code
  // The only implementation we have is if there is no message then return null
  Rhum.testSuite("getStatusMessageFull()", () => {
    Rhum.testCase(
      "Returns null if there is no message for the status code",
      () => {
        const request = TestHelpers.mockRequest("/");
        const Response = new Drash.Response(request);
        Response.status_code = 9999;
        const statusMessage = Response.getStatusMessageFull();
        Rhum.asserts.assertEquals(statusMessage, null);
      },
    );

    Rhum.testCase("Returns a valid message for a valid code", () => {
      const request = TestHelpers.mockRequest("/");
      const Response = new Drash.Response(request);
      Response.status_code = 404;
      const statusMessage = Response.getStatusMessageFull();
      Rhum.asserts.assertEquals(statusMessage, "404 (Not Found)");
    });
  });

  Rhum.testSuite("send()", () => {
    Rhum.testCase("Contains the correct data for the request", async () => {
      // Checks: status code, body and headers
      const mock = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const request = new Drash.Request(mock);
      const responseObj = new Drash.Response(request);
      responseObj.body = "Drash";
      const response = await responseObj.send();
      Rhum.asserts.assertEquals(response.status, 200);
      Rhum.asserts.assertEquals(
        decoder.decode(response.body as ArrayBuffer),
        '"Drash"',
      );
      Rhum.asserts.assertEquals(
        response.headers!.get("content-type"),
        "application/json",
      );
    });

    Rhum.testCase(
      "Contains the correct binary data for the request",
      async () => {
        // Checks: status code, body and headers
        const mock = TestHelpers.mockRequest("/", "get", {
          headers: {
            "Content-Type": "image/png",
          },
        });
        const data = new Uint8Array([1, 2, 3]);
        const request = new Drash.Request(mock);
        const responseObj = new Drash.Response(request);
        responseObj.headers.set("Content-Type", "image/png");
        responseObj.body = data;
        const response = await responseObj.send();
        Rhum.asserts.assertEquals(response.status, 200);
        Rhum.asserts.assertEquals(
          response.body,
          data,
        );
        Rhum.asserts.assertEquals(
          response.headers!.get("content-type"),
          "image/png",
        );
      },
    );
  });

  Rhum.testSuite("redirect()", () => {
    Rhum.testCase("Returns the correct data that was sent across", async () => {
      const request = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const Response = new Drash.Response(request);
      const response = Response.redirect(302, "/users/1");
      Rhum.asserts.assertEquals(response.status, 302);
      Rhum.asserts.assertEquals(response.headers!.get("location"), "/users/1");
    });
  });
});

Rhum.run();
