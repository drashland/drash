import members from "../../members.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();
const service = new Drash.Services.HttpRequestService();

members.testSuite("services/http_request_service_test.ts | accepts()", () => {
  members.test("accepts the single type if it is present in the header", () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
      },
    });
    let actual;
    actual = service.accepts(request, "application/json");
    members.assertEquals("application/json", actual);
    actual = service.accepts(request, "text/html");
    members.assertEquals("text/html", actual);
  });
  members.test("rejects the single type if it is not present in the header", () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
      },
    });
    let actual;
    actual = service.accepts(request, "text/xml");
    members.assertEquals(false, actual);
  });
  members.test("accepts the first of multiple types if it is present in the header", () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
      },
    });
    let actual;
    actual = service.accepts(request, ["application/json", "text/xml"]);
    members.assertEquals("application/json", actual);
  });
  members.test("accepts the second of multiple types if it is present in the header", () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
      },
    });
    let actual;
    actual = service.accepts(request, ["text/xml", "application/json"]);
    members.assertEquals("application/json", actual);
  });
  members.test("rejects the multiple types if none are present in the header", () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
      },
    });
    let actual;
    actual = service.accepts(request, ["text/xml", "text/plain"]);
    members.assertEquals(false, actual);
  });
});

members.testSuite("services/http_request_service_test.ts | getCookie()", () => {
  members.test("Returns the cookie value if it exists", () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
        Cookie: "test_cookie=test_cookie_value",
        credentials: "include",
      },
    });
    const cookieValue = service.getCookie(request, "test_cookie");
    members.assertEquals(cookieValue, "test_cookie_value");
  });
  members.test("Returns undefined if the cookie does not exist", () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
        Cookie: "test_cookie=test_cookie_value",
        credentials: "include",
      },
    });
    const cookieValue = service.getCookie(request, "cookie_doesnt_exist");
    members.assertEquals(cookieValue, undefined);
  });
});

// TODO(ebebbington|any) Look into how we can properly test multipart form data. Also address the doc block when we know what data is returned, and assert the correct responses below
//  @crookse has said it's been difficult to test and Deno's way of testing it has been troublesome to understand
//  Maybe look into Deno's way to see if I can get anything from it
// members.testSuite("services/http_request_service_test.ts | getRequestBodyFile()", () => {
//   members.test("Returns the file object if the file exists", async () => {
//     const formData = new FormData();
//     formData.append("file_1", "John");
//     let request = members.mockRequest("/", "POST", {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//       body: formData,
//     });
//     request = await service.hydrate(request);
//     console.log(request)
//     const fileObj = service.getRequestBodyFile(request, "file_1");
//     members.assertEquals(true, true)
//   });
//
//   members.test("Returns ??? if the file does not exist", () => {
//     members.assertEquals(true, true)
//   })
// });

members.testSuite(
  "services/http_request_service_test.ts | getRequestBodyParam()",
  () => {
    members.test("Returns the value for the parameter when the data exists", async () => {
      const body = encoder.encode(JSON.stringify({
        hello: "world",
      }));
      const reader = new Deno.Buffer(body as ArrayBuffer);
      let request = members.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
        body: reader,
      });
      request = await service.hydrate(request);
      const actual = request.getBodyParam("hello");
      members.assertEquals("world", actual);
    });
    members.test("Returns undefined when the data doesn't exist", async () => {
      const body = encoder.encode(JSON.stringify({
        hello: "world",
      }));
      const reader = new Deno.Buffer(body as ArrayBuffer);
      let request = members.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
        body: reader,
      });
      request = await service.hydrate(request);
      const actual = request.getBodyParam("dont_exist");
      members.assertEquals(undefined, actual);
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | getRequestHeaderParam()",
  () => {
    members.test("Returns the value for the header param when it exists", async () => {
      let request = members.mockRequest("/", "get", {
        headers: {
          hello: "world",
        },
      });
      request = await service.hydrate(request);
      const actual = request.getHeaderParam("hello");
      members.assertEquals("world", actual);
    });

    members.test("Returns null when the header data doesn't exist", async () => {
      let request = members.mockRequest("/", "get", {
        headers: {
          hello: "world",
        },
      });
      request = await service.hydrate(request);
      const actual = request.getHeaderParam("dont-exist");
      members.assertEquals(null, actual);
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | getRequestPathParam()",
  () => {
    members.test("Returns the value for the header param when it exists", async () => {
      let request = members.mockRequest();
      request = await service.hydrate(request);
      request.path_params = {
        hello: "world",
      };
      const actual = request.getPathParam("hello");
      members.assertEquals("world", actual);
    });

    members.test("Returns null when the header data doesn't exist", async () => {
      let request = members.mockRequest();
      request = await service.hydrate(request);
      request.path_params = {
        hello: "world",
      };
      const actual = request.getPathParam("dont-exist");
      members.assertEquals(undefined, actual);
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | getRequestUrlQueryParam()",
  () => {
    members.test("Returns the value for the query param when it exists", async () => {
      let request = members.mockRequest("/?hello=world");
      request = await service.hydrate(request);
      const actual = request.getUrlQueryParam("hello");
      members.assertEquals("world", actual);
    });

    members.test("Returns undefined when the query data doesn't exist", async () => {
      let request = members.mockRequest("/?hello=world");
      request = await service.hydrate(request);
      const actual = request.getUrlQueryParam("dont_exist");
      members.assertEquals(undefined, actual);
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | getResponseContentType()",
  () => {
    members.test("Returns application/json with no content type set", async () => {
      const request = members.mockRequest("/", "get");
      const contentType = service.getResponseContentType(request);
      members.assertEquals(contentType, "application/json");
    });

    members.test("Returns text/plain when specified in the default content type", async () => {
      const request = members.mockRequest("/", "get");
      const contentType = service.getResponseContentType(request, "text/plain");
      members.assertEquals(contentType, "text/plain");
    });

    members.test("Returns text/plain when specified in the headers", async () => {
      let request = members.mockRequest("/", "get", {
        headers: {
          "Response-Content-Type": "text/plain",
        },
      });
      const parsedBody = await service.parseBody(request);
      request.parsed_body = parsedBody;
      const contentType = service.getResponseContentType(request);
      members.assertEquals(contentType, "text/plain");
    });

    members.test("Returns text/plain when specified in the body", async () => {
      let request = members.mockRequest("/", "post", {
        body: JSON.stringify({
          "response_content_type": "text/plain",
        }),
      });
      request.parsed_body = {
        response_content_type: "text/plain",
      };
      const contentType = service.getResponseContentType(request);
      members.assertEquals(contentType, "text/plain");
    });

    members.test("Returns text/plain when specified in the query", async () => {
      let request = members.mockRequest(
        "/something?response_content_type=text/plain",
      );
      request = await service.hydrate(request);
      const contentType = service.getResponseContentType(request);
      members.assertEquals(contentType, "text/plain");
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | getUrlPath()",
  () => {
    members.test("Returns / when Url is /", async () => {
      const request = members.mockRequest("/");
      const url = service.getUrlPath(request);
      members.assertEquals("/", url);
    });

    members.test("Returns the path when it contains no queries", async () => {
      const request = members.mockRequest("/api/v2/users");
      const url = service.getUrlPath(request);
      members.assertEquals("/api/v2/users", url);
    });

    members.test("Returns the path before the querystring when the Url contains queries", async () => {
      const request = members.mockRequest("/company/users?name=John&age=44");
      const url = service.getUrlPath(request);
      members.assertEquals("/company/users", url);
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | getUrlQueryParams()",
  () => {
    members.test("Returns {} with no query strings", async () => {
      const request = members.mockRequest("/");
      const queryParams = service.getUrlQueryParams(request);
      members.assertEquals(queryParams, {});
    });

    members.test("Returns the querystring as an object when they exist", async () => {
      const request = members.mockRequest("/api/v2/users?name=John&age=44");
      const queryParams = service.getUrlQueryParams(request);
      members.assertEquals(queryParams, {
        name: "John",
        age: "44",
      });
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | getUrlQueryString()",
  () => {
    members.test("Returns null with no query strings", async () => {
      const request = members.mockRequest("/");
      const queryString = service.getUrlQueryString(request);
      members.assertEquals(queryString, null);
    });

    members.test("Returns the querystring when it exists", async () => {
      const request = members.mockRequest("/api/v2/users?name=John&age=44");
      const queryString = service.getUrlQueryString(request);
      members.assertEquals(queryString, "name=John&age=44");
    });

    members.test("Returns nothing when failure to get the querystring", async () => {
      const request = members.mockRequest("/api/v2/users?");
      const queryString = service.getUrlQueryString(request);
      members.assertEquals(queryString, "");
    });
  },
);

members.testSuite("services/http_request_service_test.ts | hasBody()", () => {
  members.test("Returns true when content-length is in the header as an int", async () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        "content-length": 52,
      },
    });
    const hasBody = await service.hasBody(request);
    members.assertEquals(hasBody, true);
  });

  members.test("Returns true when Content-Length is in the header as an int", async () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        "Content-Length": 52,
      },
    });
    const hasBody = await service.hasBody(request);
    members.assertEquals(hasBody, true);
  });

  members.test("Returns false when content-length is not in the header", async () => {
    const request = members.mockRequest("/", "get");
    const hasBody = await service.hasBody(request);
    members.assertEquals(hasBody, false);
  });

  members.test("Returns false when content-length is in the header but not as an int", async () => {
    const request = members.mockRequest("/", "get", {
      headers: {
        "content-length": "yes",
      },
    });
    const hasBody = await service.hasBody(request);
    members.assertEquals(hasBody, false);
  });
});

members.testSuite("services/http_request_service_test.ts | hydrate()", () => {
  members.test("Sets the headers on the request when passed in", async () => {
    let request = members.mockRequest("/", "get");
    const options = {
      headers: {
        "Content-Type": 32,
        "Cookie": "test_cookie=test_cookie_val",
      },
    };
    request = await service.hydrate(request, options);
    members.assertEquals(request.headers.get("content-type"), "32");
    members.assertEquals(
      request.headers.get("cookie"),
      "test_cookie=test_cookie_val",
    );
  });

  members.test("Attaches the url path", async () => {
    let request = members.mockRequest("/users");
    request = await service.hydrate(request);
    members.assertEquals(request.url_path, "/users");
  });

  members.test("Attaches the url query params", async () => {
    let request = members.mockRequest(
      "/users?name=Edward&age=not_telling",
      "get",
    );
    request = await service.hydrate(request);
    members.assertEquals(request.url_query_params, {
      name: "Edward",
      age: "not_telling",
    });
  });

  members.test("Attaches the response content type", async () => {
    let request = members.mockRequest("/", "get", {
      headers: {
        "Response-Content-Type": "text/plain",
      },
    });
    request = await service.hydrate(request);
    members.assertEquals(request.response_content_type, "text/plain");
  });

  members.test("Attaches all the required methods", async () => {
    let request = members.mockRequest();
    request = await service.hydrate(request);
    members.assertEquals("function", typeof request.getBodyFile);
    members.assertEquals("function", typeof request.getBodyParam);
    members.assertEquals("function", typeof request.getHeaderParam);
    members.assertEquals("function", typeof request.getPathParam);
    members.assertEquals("function", typeof request.getUrlQueryParam);
    members.assertEquals("function", typeof request.getCookie);
    members.assertEquals("function", typeof request.accepts);
  });
});

members.testSuite("services/http_request_service_test.ts | parseBody()", () => {
  members.test("Returns the default object when request has no body", async () => {
    const request = members.mockRequest("/");
    const ret = await service.parseBody(request);
    members.assertEquals(ret, {
      content_type: "",
      data: undefined,
    });
  });

  members.test("Defaults to application/x-www-form-urlencoded when header contains no content type", async () => {
    const body = encoder.encode("hello=world");
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const request = members.mockRequest("/", "get", {
      body: reader,
    });
    const ret = await service.parseBody(request);
    members.assertEquals(ret, {
      content_type: "application/x-www-form-urlencoded",
      data: {
        hello: "world",
      },
    });
  });

  // TODO(ebebbington) Leaving out for the time being until a way is figured out (see other comments about form data)
  // members.test("Correctly parses multipart/form-data", async () => {
  //
  // })

  // TODO(ebebbington) Leaving out for the time being until a way is figured out (see other comments about form data)
  // members.test("Fails when getting the multipart/form-data boundary", async () => {
  //
  // })

  // TODO(ebebbington) Leaving out for the time being until a way is figured out (see other comments about form data)
  // members.test("Returns the default object when no boundary was found on multipart/form-data", async () => {
  //
  // })

  // TODO(ebebbington) Leaving out for the time being until a way is figured out (see other comments about form data)
  // members.test("Fails when cannot parse the body as multipart/form-data", async () => {
  //
  // })

  // TODO(ebebbington) Fails, cannot parse as JSON. Find out how to send the correct data
  // members.test("Can correctly parse as application/json", async () => {
  //   const request = members.mockRequest("/", "post", {
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       name: "John"
  //     })
  //   });
  //   const ret = await service.parseBody(request);
  //   members.assertEquals(ret, {
  //     content_type: "application/json",
  //     data: { name: "John" }
  //   })
  // })

  members.test("Fails when error thrown whilst parsing as application/json", async () => {
    let errorThrown = false;
    try {
      const request = members.mockRequest("/", "post", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John",
        }),
      });
      const ret = await service.parseBody(request);
      members.assertEquals(ret, {
        content_type: "application/json",
        data: { name: "John" },
      });
    } catch (err) {
      errorThrown = true;
    }
    members.assertEquals(errorThrown, true);
  });

  members.test("Can correctly parse as application/x-www-form-urlencoded", async () => {
    const body = encoder.encode("hello=world");
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const request = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: reader,
    });
    const ret = await service.parseBody(request);
    members.assertEquals(ret, {
      content_type: "application/x-www-form-urlencoded",
      data: {
        hello: "world",
      },
    });
  });
});

members.testSuite(
  "services/http_request_service_test.ts | parseBodyAsFormUrlEncoded()",
  () => {
    members.test("Returns the correct data when can be parsed", async () => {
      const body = encoder.encode("hello=world");
      const reader = new Deno.Buffer(body as ArrayBuffer);
      const request = members.mockRequest("/", "get", {
        body: reader,
      });
      const actual = await service.parseBodyAsFormUrlEncoded(request);
      members.assertEquals(actual, { hello: "world" });
    });

    members.test("Returns an empty object if request has no body", async () => {
      const request = members.mockRequest("/", "get");
      const actual = await service.parseBodyAsFormUrlEncoded(request);
      members.assertEquals(actual, {});
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | parseBodyAsJson()",
  () => {
    members.test("Can correctly parse", async () => {
      const body = encoder.encode(JSON.stringify({
        hello: "world",
      }));
      const reader = new Deno.Buffer(body as ArrayBuffer);
      const request = members.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
        body: reader,
      });
      const actual = await service.parseBodyAsJson(request);
      members.assertEquals(actual, { hello: "world" });
    });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | parseBodyAsMultipartFormData()",
  async () => {
    // TODO(ebebbington) Figure out how we can do this correctly as it currently fails)
    // members.test("Can parse files", async () => {
    //   const o = await Deno.open("./tests/data/multipart_1.txt");
    //   const actual = await service.parseBodyAsMultipartFormData(
    //     o,
    //     "----------------------------434049563556637648550474",
    //     128
    //   );
    //   members.assertEquals(actual, {hello: "world"});
    // });
  },
);

members.testSuite(
  "services/http_request_service_test.ts | setHeaders()",
  async () => {
    members.test("Attaches headers to the request object", async () => {
      const request = members.mockRequest("/", "get");
      const headers = {
        "Content-Type": "application/json",
        "hello": "world",
      };
      service.setHeaders(request, headers);
      members.assertEquals(request.headers.get("hello"), "world");
      members.assertEquals(
        request.headers.get("Content-Type"),
        "application/json",
      );
    });
  },
);
