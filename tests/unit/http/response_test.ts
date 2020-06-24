import { Drash } from "../../../mod.ts";
import members from "../../members.ts";

members.testSuite("http/response_test.ts | render()", () => {
  members.test("Returns false is `views_path` is falsy", () => {
    const request = members.mockRequest("/");
    const Response = new Drash.Http.Response(request);
    const result = Response.render("/users/index.html");
    members.assertEquals(result, false);
  });

  if (Deno.build.os != "windows") {
    members.test("Returns the html content when not using the template engine", () => {
      const request = members.mockRequest("/");
      const Response = new Drash.Http.Response(request, {
        views_path: "tests/integration/app_3001_views/public/views",
      });
      const result = Response.render("/index.html");
      members.assertEquals(
        result,
        "<body>\n" +
          "    <h1>Hello Drash</h1>\n" +
          "</body>",
      );
    });
  }

  members.test("Returns the html content when using the template engine", () => {
    const request = members.mockRequest("/");
    const Response = new Drash.Http.Response(request, {
      views_path: "tests/integration/app_3001_views/public/views",
      template_engine: true,
    });
    const result = Response.render("/template_engine.html", {
      name: "Drash",
    });
    members.assertEquals(
      result,
      Deno.build.os == "windows"
        ? "<body>" +
          "      <h1>Hello Drash</h1>" +
          "  </body>"
        : "<body>" +
          "     <h1>Hello Drash</h1>" +
          " </body>",
    );
  });
});

members.testSuite("http/response_test.ts | setCookie()", () => {
  members.test("Successfully sets a cookie", () => {
    const request = members.mockRequest("/");
    const Response = new Drash.Http.Response(request);
    Response.setCookie({
      name: "Framework",
      value: "Drash",
    });
    members.assertEquals(Response.headers.get("set-cookie"), "Framework=Drash");
  });
});

members.testSuite("http/response_test.ts | delCookie()", () => {
  members.test("Successfully deletes a cookie", () => {
    const request = members.mockRequest("/");
    const Response = new Drash.Http.Response(request);
    Response.setCookie({
      name: "Framework",
      value: "Drash",
    });
    members.assertEquals(Response.headers.get("set-cookie"), "Framework=Drash");
    Response.delCookie("Framework");
    members.assertEquals(
      Response.headers.get("set-cookie"),
      "Framework=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    );
  });
});

members.testSuite("http/response_test.ts | generateResponse()", () => {
  members.test("Responds with a JSON string with application/json", () => {
    let request = members.mockRequest("/", "get", {
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
    members.assertEquals(body, '{"name":"Drash"}');
  });

  members.test("Responds with the same body for text/html", () => {
    let request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "text/html",
      },
    });
    const Response = new Drash.Http.Response(request);
    Response.body = "Hello world!";
    const body = Response.generateResponse();
    members.assertEquals(body, "Hello world!");
  });

  members.test("Responds with the same body for application/xml", () => {
    let request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/xml",
      },
    });
    const Response = new Drash.Http.Response(request);
    Response.body = "Hello world!";
    const body = Response.generateResponse();
    members.assertEquals(body, "Hello world!");
  });

  members.test("Responds with the same body for text/plain", () => {
    let request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "text/plain",
      },
    });
    const Response = new Drash.Http.Response(request);
    Response.body = "Hello world!";
    const body = Response.generateResponse();
    members.assertEquals(body, "Hello world!");
  });

  members.test("Responds with the same body for text/xml", () => {
    let request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "text/xml",
      },
    });
    const Response = new Drash.Http.Response(request);
    Response.body = "Hello world!";
    const body = Response.generateResponse();
    members.assertEquals(body, "Hello world!");
  });

  members.test("Responds with the same body for any other types", () => {
    let request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "something/orOther",
      },
    });
    const Response = new Drash.Http.Response(request);
    Response.body = "Hello world!";
    const body = Response.generateResponse();
    members.assertEquals(body, "Hello world!");
  });
});

// NOTE: Ignoring assertions for the correct message on status codes, because
// the method gets the message from std/http - which would mean we are testing Deno's code
// The only implementation we have is if there is no message then return null
members.testSuite("http/response_test.ts | getStatusMessage()", () => {
  members.test("Returns null if there is no message for the status code", () => {
    const request = members.mockRequest("/");
    const Response = new Drash.Http.Response(request);
    Response.status_code = 9999;
    const statusMessage = Response.getStatusMessage();
    members.assertEquals(statusMessage, null);
  });

  members.test("Returns a valid message for a valid code", () => {
    const request = members.mockRequest("/");
    const Response = new Drash.Http.Response(request);
    Response.status_code = 404;
    const statusMessage = Response.getStatusMessage();
    members.assertEquals(statusMessage, "Not Found");
  });
});

// NOTE: Ignoring assertions for the correct message on status codes, because
// the method gets the message from std/http - which would mean we are testing Deno's code
// The only implementation we have is if there is no message then return null
members.testSuite("http/response_test.ts | getStatusMessageFull()", () => {
  members.test("Returns null if there is no message for the status code", () => {
    const request = members.mockRequest("/");
    const Response = new Drash.Http.Response(request);
    Response.status_code = 9999;
    const statusMessage = Response.getStatusMessageFull();
    members.assertEquals(statusMessage, null);
  });

  members.test("Returns a valid message for a valid code", () => {
    const request = members.mockRequest("/");
    const Response = new Drash.Http.Response(request);
    Response.status_code = 404;
    const statusMessage = Response.getStatusMessageFull();
    members.assertEquals(statusMessage, "404 (Not Found)");
  });
});

members.testSuite("http/response_test.ts | send()", () => {
  members.test("Contains the correct data for the request", async () => {
    // Checks: status code, body and headers
    const request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
        "Accepts": "application/json",
      },
      body: JSON.stringify({
        name: "Drash",
      }),
    });
    //request.response_content_type = "application/json"
    const Response = new Drash.Http.Response(request);
    Response.body = JSON.stringify({ name: "Drash" });
    const response = await Response.send();
    members.assertEquals(response.status, 200);
    members.assertEquals(typeof response.send, "function");
    members.assertEquals(
      new TextDecoder().decode(response.body),
      '{"name":"Drash"}',
    );
    // FIXME(ebebbington) Why is the content type undefined?
    //members.assertEquals(response.headers.get("content-type"), "application/json")
  });
});

members.testSuite("http/response_test.ts | sendStatic()", () => {
  // TODO(ebebbington) Not entirely sure how to test this method... come back to it
  // members.test("Returns the correct data that was sent across", async () => {
  //   const request = members.mockRequest("/");
  //   const Response = new Drash.Http.Response(request)
  //   const response = Response.sendStatic()
  //   // Assert:
  // })
});

members.testSuite("http/response_test.ts | redirect()", () => {
  members.test("Returns the correct data that was sent across", async () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const Response = new Drash.Http.Response(request);
    const response = Response.redirect(302, "/users/1");
    members.assertEquals(response.status, 302);
    members.assertEquals(response.headers.get("location"), "/users/1");
  });
});
