import { Rhum } from "../../test_deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();

Rhum.testPlan("http/request_test.ts", () => {
  Rhum.testSuite("accepts()", () => {
    acceptsTests();
  });

  Rhum.testSuite("getCookie()", () => {
    getCookieTests();
  });

  Rhum.testSuite("getBodyFile()", () => {
    getBodyFileTests();
  });

  Rhum.testSuite("getBodyParam()", () => {
    getBodyParamTests();
  });

  Rhum.testSuite("getHeaderParam()", () => {
    getHeaderParamTests();
  });

  Rhum.testSuite("getPathParam()", () => {
    getPathParamTests();
  });

  Rhum.testSuite("getUrlQueryParam()", () => {
    getUrlQueryParamTests();
  });

  Rhum.testSuite("getUrlPath()", () => {
    getUrlPathTests();
  });

  Rhum.testSuite("getUrlQueryParams()", () => {
    getUrlQueryParamsTests();
  });

  Rhum.testSuite("getUrlQueryString()", () => {
    getUrlQueryStringTests();
  });

  Rhum.testSuite("hasBody()", () => {
    hasBodyTests();
  });

  Rhum.testSuite("parseBody()", () => {
    parseBodyTests();
  });

  Rhum.testSuite("parseBodyAsFormUrlEncoded()", () => {
    parseBodyAsFormUrlEncodedTests();
  });

  Rhum.testSuite("parseBodyAsJson()", () => {
    parseBodyAsJsonTests();
  });

  Rhum.testSuite("parseBodyAsMultipartFormData()", async () => {
    parseBodyAsMultipartFormDataTests();
  });

  Rhum.testSuite("setHeaders()", async () => {
    setHeadersTests();
  });
});

Rhum.run();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TEST CASES ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function acceptsTests() {
  Rhum.testCase(
    "accepts the single type if it is present in the header",
    () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      let actual;
      actual = request.accepts("application/json");
      Rhum.asserts.assertEquals("application/json", actual);
      actual = request.accepts("text/html");
      Rhum.asserts.assertEquals("text/html", actual);
    },
  );
  Rhum.testCase(
    "rejects the single type if it is not present in the header",
    () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      let actual;
      actual = request.accepts("text/xml");
      Rhum.asserts.assertEquals(false, actual);
    },
  );
  Rhum.testCase(
    "accepts the first of multiple types if it is present in the header",
    () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      let actual;
      actual = request.accepts(["application/json", "text/xml"]);
      Rhum.asserts.assertEquals("application/json", actual);
    },
  );
  Rhum.testCase(
    "accepts the second of multiple types if it is present in the header",
    () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      let actual;
      actual = request.accepts(["text/xml", "application/json"]);
      Rhum.asserts.assertEquals("application/json", actual);
    },
  );
  Rhum.testCase(
    "rejects the multiple types if none are present in the header",
    () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      let actual;
      actual = request.accepts(["text/xml", "text/plain"]);
      Rhum.asserts.assertEquals(false, actual);
    },
  );
}

function getCookieTests() {
  Rhum.testCase("Returns the cookie value if it exists", () => {
    const serverRequest = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
        Cookie: "test_cookie=test_cookie_value",
        credentials: "include",
      },
    });
    const request = new Drash.Http.Request(serverRequest);
    const cookieValue = request.getCookie("test_cookie");
    Rhum.asserts.assertEquals(cookieValue, "test_cookie_value");
  });
  Rhum.testCase("Returns undefined if the cookie does not exist", () => {
    const serverRequest = members.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
        Cookie: "test_cookie=test_cookie_value",
        credentials: "include",
      },
    });
    const request = new Drash.Http.Request(serverRequest);
    const cookieValue = request.getCookie("cookie_doesnt_exist");
    Rhum.asserts.assertEquals(cookieValue, undefined);
  });
}

function getBodyFileTests() {
  // TODO(ebebbington|any) Look into how we can properly test multipart form data. Also address the doc block when we know what data is returned, and assert the correct responses below
  //  @crookse has said it's been difficult to test and Deno's way of testing it has been troublesome to understand
  //  Maybe look into Deno's way to see if I can get anything from it
  // Rhum.testCase("Returns the file object if the file exists", async () => {
  //   const formData = new FormData();
  //   formData.append("file_1", "John");
  //   const serverRequest = members.mockRequest("/", "POST", {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //     },
  //     body: formData,
  //   });
  //   await request.parseBody();
  //   console.log(request);
  //   const fileObj = request.getBodyFile(request, "file_1");
  //   Rhum.asserts.assertEquals(true, true);
  // });

  // Rhum.testCase("Returns ??? if the file does not exist", () => {
  //   Rhum.asserts.assertEquals(true, true);
  // });
}

function getBodyParamTests() {
  Rhum.testCase(
    "Returns the value for the parameter when the data exists",
    async () => {
      const body = encoder.encode(JSON.stringify({
        hello: "world",
      }));
      const reader = new Deno.Buffer(body as ArrayBuffer);
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
        body: reader,
      });
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
      const actual = request.getBodyParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );
  Rhum.testCase("Returns undefined when the data doesn't exist", async () => {
    const body = encoder.encode(JSON.stringify({
      hello: "world",
    }));
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const serverRequest = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    const request = new Drash.Http.Request(serverRequest);
    await request.parseBody();
    const actual = request.getBodyParam("dont_exist");
    Rhum.asserts.assertEquals(undefined, actual);
  });
}

function getHeaderParamTests() {
  Rhum.testCase(
    "Returns the value for the header param when it exists",
    async () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          hello: "world",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
      const actual = request.getHeaderParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );

  Rhum.testCase(
    "Returns null when the header data doesn't exist",
    async () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          hello: "world",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
      const actual = request.getHeaderParam("dont-exist");
      Rhum.asserts.assertEquals(null, actual);
    },
  );
}

function getPathParamTests() {
  Rhum.testCase(
    "Returns the value for the header param when it exists",
    async () => {
      const serverRequest = members.mockRequest();
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
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
      const serverRequest = members.mockRequest();
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
      request.path_params = {
        hello: "world",
      };
      const actual = request.getPathParam("dont-exist");
      Rhum.asserts.assertEquals(undefined, actual);
    },
  );
}

function getUrlQueryParamTests() {
  Rhum.testCase(
    "Returns the value for the query param when it exists",
    async () => {
      const serverRequest = members.mockRequest("/?hello=world");
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
      const actual = request.getUrlQueryParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );

  Rhum.testCase(
    "Returns undefined when the query data doesn't exist",
    async () => {
      const serverRequest = members.mockRequest("/?hello=world");
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
      const actual = request.getUrlQueryParam("dont_exist");
      Rhum.asserts.assertEquals(undefined, actual);
    },
  );
}

function getUrlPathTests() {
  Rhum.testCase("Returns / when Url is /", async () => {
    const serverRequest = members.mockRequest("/");
    const request = new Drash.Http.Request(serverRequest);
    const url = request.getUrlPath(request);
    Rhum.asserts.assertEquals("/", url);
  });

  Rhum.testCase("Returns the path when it contains no queries", async () => {
    const serverRequest = members.mockRequest("/api/v2/users");
    const request = new Drash.Http.Request(serverRequest);
    const url = request.getUrlPath(request);
    Rhum.asserts.assertEquals("/api/v2/users", url);
  });

  Rhum.testCase(
    "Returns the path before the querystring when the Url contains queries",
    async () => {
      const serverRequest = members.mockRequest(
        "/company/users?name=John&age=44",
      );
      const request = new Drash.Http.Request(serverRequest);
      const url = request.getUrlPath(request);
      Rhum.asserts.assertEquals("/company/users", url);
    },
  );
}

function getUrlQueryParamsTests() {
  Rhum.testCase("Returns {} with no query strings", async () => {
    const serverRequest = members.mockRequest("/");
    const request = new Drash.Http.Request(serverRequest);
    const queryParams = request.getUrlQueryParams(request);
    Rhum.asserts.assertEquals(queryParams, {});
  });

  Rhum.testCase(
    "Returns the querystring as an object when they exist",
    async () => {
      const serverRequest = members.mockRequest(
        "/api/v2/users?name=John&age=44",
      );
      const request = new Drash.Http.Request(serverRequest);
      const queryParams = request.getUrlQueryParams(request);
      Rhum.asserts.assertEquals(queryParams, {
        name: "John",
        age: "44",
      });
    },
  );
}

function getUrlQueryStringTests() {
  Rhum.testCase("Returns null with no query strings", async () => {
    const serverRequest = members.mockRequest("/");
    const request = new Drash.Http.Request(serverRequest);
    const queryString = request.getUrlQueryString();
    Rhum.asserts.assertEquals(queryString, null);
  });

  Rhum.testCase("Returns the querystring when it exists", async () => {
    const serverRequest = members.mockRequest(
      "/api/v2/users?name=John&age=44",
    );
    const request = new Drash.Http.Request(serverRequest);
    const queryString = request.getUrlQueryString();
    Rhum.asserts.assertEquals(queryString, "name=John&age=44");
  });

  Rhum.testCase(
    "Returns nothing when failure to get the querystring",
    async () => {
      const serverRequest = members.mockRequest("/api/v2/users?");
      const request = new Drash.Http.Request(serverRequest);
      const queryString = request.getUrlQueryString();
      Rhum.asserts.assertEquals(queryString, "");
    },
  );
}

function hasBodyTests() {
  Rhum.testCase(
    "Returns true when content-length is in the header as an int",
    async () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          "content-length": 52,
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      const hasBody = await request.hasBody();
      Rhum.asserts.assertEquals(hasBody, true);
    },
  );

  Rhum.testCase(
    "Returns true when Content-Length is in the header as an int",
    async () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          "Content-Length": 52,
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      const hasBody = await request.hasBody();
      Rhum.asserts.assertEquals(hasBody, true);
    },
  );

  Rhum.testCase(
    "Returns false when content-length is not in the header",
    async () => {
      const serverRequest = members.mockRequest("/", "get");
      const request = new Drash.Http.Request(serverRequest);
      const hasBody = await request.hasBody();
      Rhum.asserts.assertEquals(hasBody, false);
    },
  );

  Rhum.testCase(
    "Returns false when content-length is in the header but not as an int",
    async () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          "content-length": "yes",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      const hasBody = await request.hasBody();
      Rhum.asserts.assertEquals(hasBody, false);
    },
  );
}

function parseBodyTests() {
  Rhum.testCase(
    "Returns the default object when request has no body",
    async () => {
      const serverRequest = members.mockRequest("/");
      const request = new Drash.Http.Request(serverRequest);
      const ret = await request.parseBody();
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
      const serverRequest = members.mockRequest("/", "get", {
        body: reader,
      });
      const request = new Drash.Http.Request(serverRequest);
      const ret = await request.parseBody();
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
  //   const serverRequest = members.mockRequest("/", "post", {
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       name: "John"
  //     })
  //   });
  //   const ret = await request.parseBody(request);
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
        const serverRequest = members.mockRequest("/", "post", {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "John",
          }),
        });
        const request = new Drash.Http.Request(serverRequest);
        const ret = await request.parseBody();
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
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: reader,
      });
      const request = new Drash.Http.Request(serverRequest);
      const ret = await request.parseBody();
      Rhum.asserts.assertEquals(ret, {
        content_type: "application/x-www-form-urlencoded",
        data: {
          hello: "world",
        },
      });
    },
  );
}

function parseBodyAsFormUrlEncodedTests() {
  Rhum.testCase("Returns the correct data when can be parsed", async () => {
    const body = encoder.encode("hello=world");
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const serverRequest = members.mockRequest("/", "get", {
      body: reader,
    });
    const request = new Drash.Http.Request(serverRequest);
    const actual = await request.parseBodyAsFormUrlEncoded();
    Rhum.asserts.assertEquals(actual, { hello: "world" });
  });

  Rhum.testCase(
    "Returns an empty object if request has no body",
    async () => {
      const serverRequest = members.mockRequest("/", "get");
      const request = new Drash.Http.Request(serverRequest);
      const actual = await request.parseBodyAsFormUrlEncoded();
      Rhum.asserts.assertEquals(actual, {});
    },
  );
}

function parseBodyAsJsonTests() {
  Rhum.testCase("Can correctly parse", async () => {
    const body = encoder.encode(JSON.stringify({
      hello: "world",
    }));
    const reader = new Deno.Buffer(body as ArrayBuffer);
    const serverRequest = members.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    const request = new Drash.Http.Request(serverRequest);
    const actual = await request.parseBodyAsJson();
    Rhum.asserts.assertEquals(actual, { hello: "world" });
  });
}

function parseBodyAsMultipartFormDataTests() {
  // TODO(ebebbington) Figure out how we can do this correctly as it currently fails)
  // Rhum.testCase("Can parse files", async () => {
  //   const o = await Deno.open("./tests/data/multipart_1.txt");
  //   const actual = await request.parseBodyAsMultipartFormData(
  //     o,
  //     "----------------------------434049563556637648550474",
  //     128
  //   );
  //   Rhum.asserts.assertEquals(actual, {hello: "world"});
  // });
}

function setHeadersTests() {
  Rhum.testCase("Attaches headers to the request object", async () => {
    const serverRequest = members.mockRequest("/", "get");
    const headers = {
      "Content-Type": "application/json",
      "hello": "world",
    };
    const request = new Drash.Http.Request(serverRequest);
    request.setHeaders(headers);
    Rhum.asserts.assertEquals(request.headers.get("hello"), "world");
    Rhum.asserts.assertEquals(
      request.headers.get("Content-Type"),
      "application/json",
    );
  });
}
