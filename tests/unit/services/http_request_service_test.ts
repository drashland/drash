import { Rhum } from "../../test_deps.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();
const service = new Drash.Services.HttpRequestService();

Rhum.testPlan("services/http_request_service_test.ts", () => {
  Rhum.testSuite("accepts()", () => {
    Rhum.testCase(
      "accepts the single type if it is present in the header",
      () => {
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        actual = service.accepts(request, "application/json");
        Rhum.asserts.assertEquals("application/json", actual);
        actual = service.accepts(request, "text/html");
        Rhum.asserts.assertEquals("text/html", actual);
      },
    );
    Rhum.testCase(
      "rejects the single type if it is not present in the header",
      () => {
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        actual = service.accepts(request, "text/xml");
        Rhum.asserts.assertEquals(false, actual);
      },
    );
    Rhum.testCase(
      "accepts the first of multiple types if it is present in the header",
      () => {
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        actual = service.accepts(request, ["application/json", "text/xml"]);
        Rhum.asserts.assertEquals("application/json", actual);
      },
    );
    Rhum.testCase(
      "accepts the second of multiple types if it is present in the header",
      () => {
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        actual = service.accepts(request, ["text/xml", "application/json"]);
        Rhum.asserts.assertEquals("application/json", actual);
      },
    );
    Rhum.testCase(
      "rejects the multiple types if none are present in the header",
      () => {
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            Accept: "application/json;text/html",
          },
        });
        let actual;
        actual = service.accepts(request, ["text/xml", "text/plain"]);
        Rhum.asserts.assertEquals(false, actual);
      },
    );
  });

  Rhum.testSuite("getCookie()", () => {
    Rhum.testCase("Returns the cookie value if it exists", () => {
      const request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
          Cookie: "test_cookie=test_cookie_value",
          credentials: "include",
        },
      });
      const cookieValue = service.getCookie(request, "test_cookie");
      Rhum.asserts.assertEquals(cookieValue, "test_cookie_value");
    });
    Rhum.testCase("Returns undefined if the cookie does not exist", () => {
      const request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
          Cookie: "test_cookie=test_cookie_value",
          credentials: "include",
        },
      });
      const cookieValue = service.getCookie(request, "cookie_doesnt_exist");
      Rhum.asserts.assertEquals(cookieValue, undefined);
    });
  });

  // TODO(ebebbington|any) Look into how we can properly test multipart form data. Also address the doc block when we know what data is returned, and assert the correct responses below
  //  @crookse has said it's been difficult to test and Deno's way of testing it has been troublesome to understand
  //  Maybe look into Deno's way to see if I can get anything from it
  // Rhum.testSuite("services/http_request_service_test.ts | getRequestBodyFile()", () => {
  //   Rhum.testCase("Returns the file object if the file exists", async () => {
  //     const formData = new FormData();
  //     formData.append("file_1", "John");
  //     let request = Rhum.mocks.ServerRequest("/", "POST", {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //       body: formData,
  //     });
  //     request = await service.hydrate(request);
  //     console.log(request)
  //     const fileObj = service.getRequestBodyFile(request, "file_1");
  //     Rhum.asserts.assertEquals(true, true)
  //   });
  //
  //   Rhum.testCase("Returns ??? if the file does not exist", () => {
  //     Rhum.asserts.assertEquals(true, true)
  //   })
  // });

  Rhum.testSuite("getRequestBodyParam()", () => {
    Rhum.testCase(
      "Returns the value for the parameter when the data exists",
      async () => {
        const body = encoder.encode(JSON.stringify({
          hello: "world",
        }));
        const reader = new Deno.Buffer(body as ArrayBuffer);
        let request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            "Content-Type": "application/json",
          },
          body: reader,
        });
        request = await service.hydrate(request);
        const actual = request.getBodyParam("hello");
        Rhum.asserts.assertEquals("world", actual);
      },
    );
    Rhum.testCase("Returns undefined when the data doesn't exist", async () => {
      const body = encoder.encode(JSON.stringify({
        hello: "world",
      }));
      const reader = new Deno.Buffer(body as ArrayBuffer);
      let request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
        body: reader,
      });
      request = await service.hydrate(request);
      const actual = request.getBodyParam("dont_exist");
      Rhum.asserts.assertEquals(undefined, actual);
    });
  });

  Rhum.testSuite("getRequestHeaderParam()", () => {
    Rhum.testCase(
      "Returns the value for the header param when it exists",
      async () => {
        let request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            hello: "world",
          },
        });
        request = await service.hydrate(request);
        const actual = request.getHeaderParam("hello");
        Rhum.asserts.assertEquals("world", actual);
      },
    );

    Rhum.testCase(
      "Returns null when the header data doesn't exist",
      async () => {
        let request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            hello: "world",
          },
        });
        request = await service.hydrate(request);
        const actual = request.getHeaderParam("dont-exist");
        Rhum.asserts.assertEquals(null, actual);
      },
    );
  });

  Rhum.testSuite("getRequestPathParam()", () => {
    Rhum.testCase(
      "Returns the value for the header param when it exists",
      async () => {
        let request = Rhum.mocks.ServerRequest();
        request = await service.hydrate(request);
        request.path_params = {
          hello: "world",
        };
        const actual = request.getPathParam("hello");
        Rhum.asserts.assertEquals("world", actual);
      },
    );

    Rhum.testCase(
      "Returns null when the header data doesn't exist",
      async () => {
        let request = Rhum.mocks.ServerRequest();
        request = await service.hydrate(request);
        request.path_params = {
          hello: "world",
        };
        const actual = request.getPathParam("dont-exist");
        Rhum.asserts.assertEquals(undefined, actual);
      },
    );
  });

  Rhum.testSuite("getRequestUrlQueryParam()", () => {
    Rhum.testCase(
      "Returns the value for the query param when it exists",
      async () => {
        let request = Rhum.mocks.ServerRequest("/?hello=world");
        request = await service.hydrate(request);
        const actual = request.getUrlQueryParam("hello");
        Rhum.asserts.assertEquals("world", actual);
      },
    );

    Rhum.testCase(
      "Returns undefined when the query data doesn't exist",
      async () => {
        let request = Rhum.mocks.ServerRequest("/?hello=world");
        request = await service.hydrate(request);
        const actual = request.getUrlQueryParam("dont_exist");
        Rhum.asserts.assertEquals(undefined, actual);
      },
    );
  });

  Rhum.testSuite("getResponseContentType()", () => {
    Rhum.testCase(
      "Returns application/json with no content type set",
      async () => {
        const request = Rhum.mocks.ServerRequest("/", "get");
        const contentType = service.getResponseContentType(request);
        Rhum.asserts.assertEquals(contentType, "application/json");
      },
    );

    Rhum.testCase(
      "Returns text/plain when specified in the default content type",
      async () => {
        const request = Rhum.mocks.ServerRequest("/", "get");
        const contentType = service.getResponseContentType(
          request,
          "text/plain",
        );
        Rhum.asserts.assertEquals(contentType, "text/plain");
      },
    );

    Rhum.testCase(
      "Returns text/plain when specified in the headers",
      async () => {
        let request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            "Response-Content-Type": "text/plain",
          },
        });
        const parsedBody = await service.parseBody(request);
        request.parsed_body = parsedBody;
        const contentType = service.getResponseContentType(request);
        Rhum.asserts.assertEquals(contentType, "text/plain");
      },
    );

    Rhum.testCase("Returns text/plain when specified in the body", async () => {
      let request = Rhum.mocks.ServerRequest("/", "post", {
        body: JSON.stringify({
          "response_content_type": "text/plain",
        }),
      });
      request.parsed_body = {
        response_content_type: "text/plain",
      };
      const contentType = service.getResponseContentType(request);
      Rhum.asserts.assertEquals(contentType, "text/plain");
    });

    Rhum.testCase(
      "Returns text/plain when specified in the query",
      async () => {
        let request = Rhum.mocks.ServerRequest(
          "/something?response_content_type=text/plain",
        );
        request = await service.hydrate(request);
        const contentType = service.getResponseContentType(request);
        Rhum.asserts.assertEquals(contentType, "text/plain");
      },
    );
  });

  Rhum.testSuite("getUrlPath()", () => {
    Rhum.testCase("Returns / when Url is /", async () => {
      const request = Rhum.mocks.ServerRequest("/");
      const url = service.getUrlPath(request);
      Rhum.asserts.assertEquals("/", url);
    });

    Rhum.testCase("Returns the path when it contains no queries", async () => {
      const request = Rhum.mocks.ServerRequest("/api/v2/users");
      const url = service.getUrlPath(request);
      Rhum.asserts.assertEquals("/api/v2/users", url);
    });

    Rhum.testCase(
      "Returns the path before the querystring when the Url contains queries",
      async () => {
        const request = Rhum.mocks.ServerRequest(
          "/company/users?name=John&age=44",
        );
        const url = service.getUrlPath(request);
        Rhum.asserts.assertEquals("/company/users", url);
      },
    );
  });

  Rhum.testSuite("getUrlQueryParams()", () => {
    Rhum.testCase("Returns {} with no query strings", async () => {
      const request = Rhum.mocks.ServerRequest("/");
      const queryParams = service.getUrlQueryParams(request);
      Rhum.asserts.assertEquals(queryParams, {});
    });

    Rhum.testCase(
      "Returns the querystring as an object when they exist",
      async () => {
        const request = Rhum.mocks.ServerRequest(
          "/api/v2/users?name=John&age=44",
        );
        const queryParams = service.getUrlQueryParams(request);
        Rhum.asserts.assertEquals(queryParams, {
          name: "John",
          age: "44",
        });
      },
    );
  });

  Rhum.testSuite("getUrlQueryString()", () => {
    Rhum.testCase("Returns null with no query strings", async () => {
      const request = Rhum.mocks.ServerRequest("/");
      const queryString = service.getUrlQueryString(request);
      Rhum.asserts.assertEquals(queryString, null);
    });

    Rhum.testCase("Returns the querystring when it exists", async () => {
      const request = Rhum.mocks.ServerRequest(
        "/api/v2/users?name=John&age=44",
      );
      const queryString = service.getUrlQueryString(request);
      Rhum.asserts.assertEquals(queryString, "name=John&age=44");
    });

    Rhum.testCase(
      "Returns nothing when failure to get the querystring",
      async () => {
        const request = Rhum.mocks.ServerRequest("/api/v2/users?");
        const queryString = service.getUrlQueryString(request);
        Rhum.asserts.assertEquals(queryString, "");
      },
    );
  });

  Rhum.testSuite("hasBody()", () => {
    Rhum.testCase(
      "Returns true when content-length is in the header as an int",
      async () => {
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            "content-length": 52,
          },
        });
        const hasBody = await service.hasBody(request);
        Rhum.asserts.assertEquals(hasBody, true);
      },
    );

    Rhum.testCase(
      "Returns true when Content-Length is in the header as an int",
      async () => {
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            "Content-Length": 52,
          },
        });
        const hasBody = await service.hasBody(request);
        Rhum.asserts.assertEquals(hasBody, true);
      },
    );

    Rhum.testCase(
      "Returns false when content-length is not in the header",
      async () => {
        const request = Rhum.mocks.ServerRequest("/", "get");
        const hasBody = await service.hasBody(request);
        Rhum.asserts.assertEquals(hasBody, false);
      },
    );

    Rhum.testCase(
      "Returns false when content-length is in the header but not as an int",
      async () => {
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            "content-length": "yes",
          },
        });
        const hasBody = await service.hasBody(request);
        Rhum.asserts.assertEquals(hasBody, false);
      },
    );
  });

  Rhum.testSuite("hydrate()", () => {
    Rhum.testCase(
      "Sets the headers on the request when passed in",
      async () => {
        let request = Rhum.mocks.ServerRequest("/", "get");
        const options = {
          headers: {
            "Content-Type": 32,
            "Cookie": "test_cookie=test_cookie_val",
          },
        };
        request = await service.hydrate(request, options);
        Rhum.asserts.assertEquals(request.headers.get("content-type"), "32");
        Rhum.asserts.assertEquals(
          request.headers.get("cookie"),
          "test_cookie=test_cookie_val",
        );
      },
    );

    Rhum.testCase("Attaches the url path", async () => {
      let request = Rhum.mocks.ServerRequest("/users");
      request = await service.hydrate(request);
      Rhum.asserts.assertEquals(request.url_path, "/users");
    });

    Rhum.testCase("Attaches the url query params", async () => {
      let request = Rhum.mocks.ServerRequest(
        "/users?name=Edward&age=not_telling",
        "get",
      );
      request = await service.hydrate(request);
      Rhum.asserts.assertEquals(request.url_query_params, {
        name: "Edward",
        age: "not_telling",
      });
    });

    Rhum.testCase("Attaches the response content type", async () => {
      let request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Response-Content-Type": "text/plain",
        },
      });
      request = await service.hydrate(request);
      Rhum.asserts.assertEquals(request.response_content_type, "text/plain");
    });

    Rhum.testCase("Attaches all the required methods", async () => {
      let request = Rhum.mocks.ServerRequest();
      request = await service.hydrate(request);
      Rhum.asserts.assertEquals("function", typeof request.getBodyFile);
      Rhum.asserts.assertEquals("function", typeof request.getBodyParam);
      Rhum.asserts.assertEquals("function", typeof request.getHeaderParam);
      Rhum.asserts.assertEquals("function", typeof request.getPathParam);
      Rhum.asserts.assertEquals("function", typeof request.getUrlQueryParam);
      Rhum.asserts.assertEquals("function", typeof request.getCookie);
      Rhum.asserts.assertEquals("function", typeof request.accepts);
    });
  });

  Rhum.testSuite("parseBody()", () => {
    Rhum.testCase(
      "Returns the default object when request has no body",
      async () => {
        const request = Rhum.mocks.ServerRequest("/");
        const ret = await service.parseBody(request);
        Rhum.asserts.assertEquals(ret, {
          content_type: "",
          data: undefined,
        });
      },
    );

    Rhum.testCase(
      "Defaults to application/x-www-form-urlencoded when header contains no content type",
      async () => {
        const body = encoder.encode("hello=world");
        const reader = new Deno.Buffer(body as ArrayBuffer);
        const request = Rhum.mocks.ServerRequest("/", "get", {
          body: reader,
        });
        const ret = await service.parseBody(request);
        Rhum.asserts.assertEquals(ret, {
          content_type: "application/x-www-form-urlencoded",
          data: {
            hello: "world",
          },
        });
      },
    );

    // TODO(ebebbington) Leaving out for the time being until a way is figured out (see other comments about form data)
    // Rhum.testCase("Correctly parses multipart/form-data", async () => {
    //
    // })

    // TODO(ebebbington) Leaving out for the time being until a way is figured out (see other comments about form data)
    // Rhum.testCase("Fails when getting the multipart/form-data boundary", async () => {
    //
    // })

    // TODO(ebebbington) Leaving out for the time being until a way is figured out (see other comments about form data)
    // Rhum.testCase("Returns the default object when no boundary was found on multipart/form-data", async () => {
    //
    // })

    // TODO(ebebbington) Leaving out for the time being until a way is figured out (see other comments about form data)
    // Rhum.testCase("Fails when cannot parse the body as multipart/form-data", async () => {
    //
    // })

    // TODO(ebebbington) Fails, cannot parse as JSON. Find out how to send the correct data
    // Rhum.testCase("Can correctly parse as application/json", async () => {
    //   const request = Rhum.mocks.ServerRequest("/", "post", {
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //       name: "John"
    //     })
    //   });
    //   const ret = await service.parseBody(request);
    //   Rhum.asserts.assertEquals(ret, {
    //     content_type: "application/json",
    //     data: { name: "John" }
    //   })
    // })

    Rhum.testCase(
      "Fails when error thrown whilst parsing as application/json",
      async () => {
        let errorThrown = false;
        try {
          const request = Rhum.mocks.ServerRequest("/", "post", {
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: "John",
            }),
          });
          const ret = await service.parseBody(request);
          Rhum.asserts.assertEquals(ret, {
            content_type: "application/json",
            data: { name: "John" },
          });
        } catch (err) {
          errorThrown = true;
        }
        Rhum.asserts.assertEquals(errorThrown, true);
      },
    );

    Rhum.testCase(
      "Can correctly parse as application/x-www-form-urlencoded",
      async () => {
        const body = encoder.encode("hello=world");
        const reader = new Deno.Buffer(body as ArrayBuffer);
        const request = Rhum.mocks.ServerRequest("/", "get", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: reader,
        });
        const ret = await service.parseBody(request);
        Rhum.asserts.assertEquals(ret, {
          content_type: "application/x-www-form-urlencoded",
          data: {
            hello: "world",
          },
        });
      },
    );
  });

  Rhum.testSuite("parseBodyAsFormUrlEncoded()", () => {
    Rhum.testCase("Returns the correct data when can be parsed", async () => {
      const body = encoder.encode("hello=world");
      const reader = new Deno.Buffer(body as ArrayBuffer);
      const request = Rhum.mocks.ServerRequest("/", "get", {
        body: reader,
      });
      const actual = await service.parseBodyAsFormUrlEncoded(request);
      Rhum.asserts.assertEquals(actual, { hello: "world" });
    });

    Rhum.testCase(
      "Returns an empty object if request has no body",
      async () => {
        const request = Rhum.mocks.ServerRequest("/", "get");
        const actual = await service.parseBodyAsFormUrlEncoded(request);
        Rhum.asserts.assertEquals(actual, {});
      },
    );
  });

  Rhum.testSuite("parseBodyAsJson()", () => {
    Rhum.testCase("Can correctly parse", async () => {
      const body = encoder.encode(JSON.stringify({
        hello: "world",
      }));
      const reader = new Deno.Buffer(body as ArrayBuffer);
      const request = Rhum.mocks.ServerRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
        body: reader,
      });
      const actual = await service.parseBodyAsJson(request);
      Rhum.asserts.assertEquals(actual, { hello: "world" });
    });
  });

  Rhum.testSuite("parseBodyAsMultipartFormData()", async () => {
    // TODO(ebebbington) Figure out how we can do this correctly as it currently fails)
    // Rhum.testCase("Can parse files", async () => {
    //   const o = await Deno.open("./tests/data/multipart_1.txt");
    //   const actual = await service.parseBodyAsMultipartFormData(
    //     o,
    //     "----------------------------434049563556637648550474",
    //     128
    //   );
    //   Rhum.asserts.assertEquals(actual, {hello: "world"});
    // });
  });

  Rhum.testSuite("setHeaders()", async () => {
    Rhum.testCase("Attaches headers to the request object", async () => {
      const request = Rhum.mocks.ServerRequest("/", "get");
      const headers = {
        "Content-Type": "application/json",
        "hello": "world",
      };
      service.setHeaders(request, headers);
      Rhum.asserts.assertEquals(request.headers.get("hello"), "world");
      Rhum.asserts.assertEquals(
        request.headers.get("Content-Type"),
        "application/json",
      );
    });
  });
});

Rhum.run();
