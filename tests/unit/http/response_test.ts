import { Rhum } from "../../test_deps.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("http/response_test.ts", () => {
  Rhum.testSuite("render()", () => {
    Rhum.testCase("Returns false is `views_path` is falsy", () => {
      const request = Rhum.mocks.ServerRequest("/");
      const Response = new Drash.Http.Response(request);
      const result = Response.render("/users/index.html");
      Rhum.asserts.assertEquals(result, false);
    });

    if (Deno.build.os != "windows") {
      Rhum.testCase(
        "Returns the html content when not using the template engine",
        () => {
          const request = Rhum.mocks.ServerRequest("/");
          const Response = new Drash.Http.Response(request, {
            views_path: "tests/integration/app_3001_views/public/views",
          });
          const result = Response.render("/index.html");
          Rhum.asserts.assertEquals(
            result,
            `<body>\n` +
              `    <h1>Hello Drash</h1>\n` +
              `</body>`,
          );
        },
      );

      Rhum.testCase(
        "Returns the html content when using the template engine",
        () => {
          const request = Rhum.mocks.ServerRequest("/");
          const Response = new Drash.Http.Response(request, {
            views_path: "tests/integration/app_3001_views/public/views",
            template_engine: true,
          });
          const result = Response.render("/template_engine.html", {
            name: "Drash",
          });
          Rhum.asserts.assertEquals(
            result,
            "<body>" +
              "     <h1>Hello Drash</h1>" +
              " </body>",
          );
        },
      );
    }
  });

  Rhum.testSuite("setCookie()", () => {
    Rhum.testCase("Successfully sets a cookie", () => {
      const request = Rhum.mocks.ServerRequest("/");
      const Response = new Drash.Http.Response(request);
      Response.setCookie({
        name: "Framework",
        value: "Drash",
      });
      Rhum.asserts.assertEquals(
        Response.headers.get("set-cookie"),
        "Framework=Drash",
      );
    });
  });

  Rhum.testSuite("delCookie()", () => {
    Rhum.testCase("Successfully deletes a cookie", () => {
      const request = Rhum.mocks.ServerRequest("/");
      const Response = new Drash.Http.Response(request);
      Response.setCookie({
        name: "Framework",
        value: "Drash",
      });
      Rhum.asserts.assertEquals(
        Response.headers.get("set-cookie"),
        "Framework=Drash",
      );
      Response.delCookie("Framework");
      Rhum.asserts.assertEquals(
        Response.headers.get("set-cookie"),
        "Framework=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      );
    });
  });

  Rhum.testSuite("generateResponse()", () => {
    Rhum.testCase("Responds with a JSON string with application/json", () => {
      let request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      request.response_content_type = "application/json";
      const Response = new Drash.Http.Response(request);
      Response.body = {
        name: "Drash",
      };
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, '{"name":"Drash"}');
    });

    Rhum.testCase("Responds with the same body for text/html", () => {
      let request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "text/html",
        },
      });
      const Response = new Drash.Http.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, "Hello world!");
    });

    Rhum.testCase("Responds with the same body for application/xml", () => {
      let request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "application/xml",
        },
      });
      const Response = new Drash.Http.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, "Hello world!");
    });

    Rhum.testCase("Responds with the same body for text/plain", () => {
      let request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "text/plain",
        },
      });
      const Response = new Drash.Http.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, "Hello world!");
    });

    Rhum.testCase("Responds with the same body for text/xml", () => {
      let request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "text/xml",
        },
      });
      const Response = new Drash.Http.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, "Hello world!");
    });

    Rhum.testCase("Responds with the same body for any other types", () => {
      let request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "something/orOther",
        },
      });
      const Response = new Drash.Http.Response(request);
      Response.body = "Hello world!";
      const body = Response.generateResponse();
      Rhum.asserts.assertEquals(body, "Hello world!");
    });
  });

  // NOTE: Ignoring assertions for the correct message on status codes, because
  // the method gets the message from std/http - which would mean we are testing Deno's code
  // The only implementation we have is if there is no message then return null
  Rhum.testSuite("getStatusMessage()", () => {
    Rhum.testCase(
      "Returns null if there is no message for the status code",
      () => {
        const request = Rhum.mocks.ServerRequest("/");
        const Response = new Drash.Http.Response(request);
        Response.status_code = 9999;
        const statusMessage = Response.getStatusMessage();
        Rhum.asserts.assertEquals(statusMessage, null);
      },
    );

    Rhum.testCase("Returns a valid message for a valid code", () => {
      const request = Rhum.mocks.ServerRequest("/");
      const Response = new Drash.Http.Response(request);
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
        const request = Rhum.mocks.ServerRequest("/");
        const Response = new Drash.Http.Response(request);
        Response.status_code = 9999;
        const statusMessage = Response.getStatusMessageFull();
        Rhum.asserts.assertEquals(statusMessage, null);
      },
    );

    Rhum.testCase("Returns a valid message for a valid code", () => {
      const request = Rhum.mocks.ServerRequest("/");
      const Response = new Drash.Http.Response(request);
      Response.status_code = 404;
      const statusMessage = Response.getStatusMessageFull();
      Rhum.asserts.assertEquals(statusMessage, "404 (Not Found)");
    });
  });

  Rhum.testSuite("send()", () => {
    Rhum.testCase("Contains the correct data for the request", async () => {
      // Checks: status code, body and headers
      const mock = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const request = await new Drash.Services.HttpRequestService()
        .hydrate(mock);
      const responseObj = new Drash.Http.Response(request);
      responseObj.body = "Drash";
      const response = await responseObj.send();
      Rhum.asserts.assertEquals(response.status, 200);
      Rhum.asserts.assertEquals(typeof response.send, "function");
      Rhum.asserts.assertEquals(
        new TextDecoder().decode(response.body),
        '\"Drash\"',
      );
      Rhum.asserts.assertEquals(
        response.headers.get("content-type"),
        "application/json",
      );
    });
  });

  Rhum.testSuite("sendStatic()", () => {
    Rhum.testCase("Returns the contents if a file is passed in", async () => {
      const request = Rhum.mocks.ServerRequest("/");
      const response = new Drash.Http.Response(request);
      const actual = response.sendStatic("./tests/data/static_file.txt");
      const headers = new Headers();
      headers.set("content-type", "undefined");
      const expected = {
        status: 200,
        headers: headers,
        body: Deno.build.os === "windows"
          ? new TextEncoder().encode("test\n\r")
          : new TextEncoder().encode("test\n")
      };
      Rhum.asserts.assertEquals(actual.status, expected.status);
      Rhum.asserts.assertEquals(actual.headers, expected.headers);
      Rhum.asserts.assertEquals(actual.body, expected.body);
    });
  });

  Rhum.testSuite("redirect()", () => {
    Rhum.testCase("Returns the correct data that was sent across", async () => {
      const request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const Response = new Drash.Http.Response(request);
      const response = Response.redirect(302, "/users/1");
      Rhum.asserts.assertEquals(response.status, 302);
      Rhum.asserts.assertEquals(response.headers.get("location"), "/users/1");
    });
  });
});

Rhum.run();
