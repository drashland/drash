import { isFormFile, MultipartReader, path, Rhum } from "../../deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";
const encoder = new TextEncoder();

// Taken  from https://github.com/denoland/deno/blob/2da084058397efd6f517ba98c9882760ec0a7bd6/cli/tests/unit/fetch_test.ts#L261
// It's how Deno test their multipart tests
const files = [
  {
    // prettier-ignore
    content: new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 137, 1, 25]),
    type: "image/png",
    name: "image",
    fileName: "some-image.png",
  },
  {
    // prettier-ignore
    content: new Uint8Array(
      [
        108,
        2,
        0,
        0,
        145,
        22,
        162,
        61,
        157,
        227,
        166,
        77,
        138,
        75,
        180,
        56,
        119,
        188,
        177,
        183,
      ],
    ),
    name: "file",
    fileName: "file.bin",
    expectedType: "application/octet-stream",
  },
  {
    content: new TextEncoder().encode("deno land"),
    type: "text/plain",
    name: "text",
    fileName: "deno.txt",
  },
];

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

  Rhum.testSuite("getAllUrlQueryParams()", () => {
    getAllUrlQueryParamsTests();
  });

  Rhum.testSuite("getUrlPath()", () => {
    getUrlPathTests();
  });

  Rhum.testSuite("getUrlQueryString()", () => {
    getUrlQueryStringTests();
  });

  Rhum.testSuite("getAllHeaderParams()", () => {
    getAllHeaderParamsTests();
  });

  Rhum.testSuite("getAllBodyParams()", () => {
    getAllBodyParamsTests();
  });

  Rhum.testSuite("getAllPathParams()", () => {
    getAllPathParamsTests();
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
  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  Rhum.testCase("Returns the file object if the file exists", async () => {
    const serverRequest = members.mockRequest();
    const request = new Drash.Http.Request(serverRequest);
    const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
    const form = await request.parseBodyAsMultipartFormData(
      o,
      "--------------------------434049563556637648550474",
      128,
    );
    const pb: Drash.Interfaces.ParsedRequestBody = {
      content_type: "multipart/form-data",
      data: form,
    };
    request.parsed_body = pb;
    const file = request.getBodyFile("file");
    Rhum.asserts.assertEquals(file!.filename, "tsconfig.json");
    Rhum.asserts.assertEquals(file!.type, "application/octet-stream");
    Rhum.asserts.assertEquals(file!.size, 233);
    const content = file!.content;
    if (content !== undefined) {
      Rhum.asserts.assertEquals(content.constructor === Uint8Array, true);
    } else {
      // The content of the file should be set!
      Rhum.asserts.assertEquals(true, false);
    }
    await o.close();
  });

  Rhum.testCase("Returns undefined if the file does not exist", async () => {
    const serverRequest = members.mockRequest();
    const request = new Drash.Http.Request(serverRequest);
    const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
    const form = await request.parseBodyAsMultipartFormData(
      o,
      "--------------------------434049563556637648550474",
      128,
    );
    const pb: Drash.Interfaces.ParsedRequestBody = {
      content_type: "multipart/form-data",
      data: form,
    };
    request.parsed_body = pb;
    const file = request.getBodyFile("dontExist");
    Rhum.asserts.assertEquals(file, undefined);
    await o.close();
  });
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
  Rhum.testCase("Returns null when the data doesn't exist", async () => {
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
    Rhum.asserts.assertEquals(null, actual);
  });

  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  Rhum.testCase(
    "Returns the value for the parameter when it exists and request is multipart/form-data",
    async () => {
      const serverRequest = members.mockRequest();
      const request = new Drash.Http.Request(serverRequest);
      const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
      const form = await request.parseBodyAsMultipartFormData(
        o,
        "--------------------------434049563556637648550474",
        128,
      );
      const pb: Drash.Interfaces.ParsedRequestBody = {
        content_type: "multipart/form-data",
        data: form,
      };
      request.parsed_body = pb;
      Rhum.asserts.assertEquals(request.getBodyParam("foo"), "foo");
      await o.close();
    },
  );
  // Before the date of 5th, Oct 2020, type errors were thrown for objects because the return value of `getBodyParam` was either a string or null
  Rhum.testCase("Can handle when a body param is an object", async () => {
    const body = encoder.encode(JSON.stringify({
      user: {
        name: "Edward",
        location: "UK",
      },
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
    const actual = request.getBodyParam("user");
    Rhum.asserts.assertEquals({
      name: "Edward",
      location: "UK",
    }, actual);
    const name = (actual as { [key: string]: unknown }).name; // Ensuring we can access it and TS doesn't throw errors
    Rhum.asserts.assertEquals(name, "Edward");
  });
  Rhum.testCase("Can handle when a body param is an array", async () => {
    const body = encoder.encode(JSON.stringify({
      usernames: ["Edward", "John Smith", "Lord Voldemort", "Count Dankula"],
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
    const actual = request.getBodyParam("usernames");
    Rhum.asserts.assertEquals(
      ["Edward", "John Smith", "Lord Voldemort", "Count Dankula"],
      actual,
    );
    const firstName = (actual as Array<string>)[0];
    Rhum.asserts.assertEquals(firstName, "Edward");
  });
  Rhum.testCase("Can handle when a body param is a boolean", async () => {
    const body = encoder.encode(JSON.stringify({
      authenticated: false,
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
    const actual = request.getBodyParam("authenticated");
    Rhum.asserts.assertEquals(actual, false);
    const authenticated = (actual as boolean);
    Rhum.asserts.assertEquals(authenticated, false);
  });
}

function getAllHeaderParamsTests() {
  Rhum.testCase(
    "Returns all the header params",
    async () => {
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          hello: "world",
        },
      });
      const request = new Drash.Http.Request(serverRequest);
      const actual = request.getAllHeaderParams();
      Rhum.asserts.assertEquals(actual, {
        hello: "world",
      });
    },
  );
}

function getAllBodyParamsTests() {
  Rhum.testCase(
    "Returns the value for the header param when it exists",
    async () => {
      const data = {
        name: "Ed",
        age: 22,
      };
      const body = encoder.encode(JSON.stringify(data));
      const reader = new Deno.Buffer(body as ArrayBuffer);
      const serverRequest = members.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": JSON.stringify(data).length,
        },
        body: reader,
      });
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
      const actual = request.getAllBodyParams();
      Rhum.asserts.assertEquals(actual, {
        content_type: "application/json",
        data: {
          age: 22,
          name: "Ed",
        },
      });
    },
  );
}

function getAllPathParamsTests() {
  Rhum.testCase(
    "Returns all path params",
    async () => {
      const expected = {
        param_1: "user",
        param_2: "name",
      };
      const serverRequest = members.mockRequest("/user/name", "get");
      const request = new Drash.Http.Request(serverRequest);
      request.path_params = expected;
      const actual = request.getAllPathParams();
      Rhum.asserts.assertEquals(actual, expected);
    },
  );
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
      Rhum.asserts.assertEquals(null, actual);
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
    "Returns null when the query data doesn't exist",
    async () => {
      const serverRequest = members.mockRequest("/?hello=world");
      const request = new Drash.Http.Request(serverRequest);
      await request.parseBody();
      const actual = request.getUrlQueryParam("dont_exist");
      Rhum.asserts.assertEquals(null, actual);
    },
  );
}

function getUrlPathTests() {
  Rhum.testCase("Returns / when Url is /", async () => {
    const serverRequest = members.mockRequest("/");
    const request = new Drash.Http.Request(serverRequest);
    const url = request.getUrlPath();
    Rhum.asserts.assertEquals("/", url);
  });

  Rhum.testCase("Returns the path when it contains no queries", async () => {
    const serverRequest = members.mockRequest("/api/v2/users");
    const request = new Drash.Http.Request(serverRequest);
    const url = request.getUrlPath();
    Rhum.asserts.assertEquals("/api/v2/users", url);
  });

  Rhum.testCase(
    "Returns the path before the querystring when the Url contains queries",
    async () => {
      const serverRequest = members.mockRequest(
        "/company/users?name=John&age=44",
      );
      const request = new Drash.Http.Request(serverRequest);
      const url = request.getUrlPath();
      Rhum.asserts.assertEquals("/company/users", url);
    },
  );
}

function getAllUrlQueryParamsTests() {
  Rhum.testCase("Returns {} with no query strings", async () => {
    const serverRequest = members.mockRequest("/");
    const request = new Drash.Http.Request(serverRequest);
    const queryParams = request.getAllUrlQueryParams();
    Rhum.asserts.assertEquals(queryParams, {});
  });

  Rhum.testCase(
    "Returns the querystring as an object when they exist",
    async () => {
      const serverRequest = members.mockRequest(
        "/api/v2/users?name=John&age=44",
      );
      const request = new Drash.Http.Request(serverRequest);
      const queryParams = request.getAllUrlQueryParams();
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

  // TODO(ebebbington) Leaving out for the time being until a way is figured out
  // Rhum.testCase("Correctly parses multipart/form-data", async () => {
  //   // Need to set the body of the original request for parseBody to work when it calls parseBodyAsMultipartFormData
  //   const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
  //   const boundary = "--------------------------434049563556637648550474";
  //   const formOne = await new Drash.Http.Request(members.mockRequest())
  //     .parseBodyAsMultipartFormData( // method 1
  //       o,
  //       boundary,
  //       128,
  //     );
  //   const formTwo = new FormData(); // method 2
  //   formTwo.append("field", "value");
  //   for (const file of files) {
  //     formTwo.append(
  //       file.name,
  //       new Blob([file.content], { type: file.type }),
  //       file.fileName,
  //     );
  //   }
  //   let originalRequest = members.mockRequest("/orig", "post", {
  //     body: o,
  //   });
  //   const newRequest = new Drash.Http.Request(originalRequest);
  //   newRequest.headers.set(
  //     "Content-Type",
  //     "multipart/form-data; boundary=" + boundary,
  //   ); // Needed since the method gets boundary from header
  //   newRequest.headers.set("Content-Length", "883"); // Tells parseBody that this request has a body
  //   // Send request
  //   console.log("start");
  //   /**
  //    * Feel free to add the below logging before `await this.parseMultipartFormDataBody` in `parseBody()`:
  //    * console.log("[parseBody]")
  //    * console.log("this.original_request.body:")
  //    * console.log(this.original_request.body)
  //    * console.log("boundary:")
  //    * console.log(boundary)
  //    * console.log("maxMemory:")
  //    * console.log(maxMemory)
  //    *
  //    * The problem is inside the above method, `mr.readForm` is throwing the error: UnexpectedEof
  //    * I have a feeling the  `this.original_request.body` isn't what is expected, as if we replace
  //    * `body` in that method with `await Deno.open(path.resolve("./tests/data/sample_1.txt"))`, it
  //    * works - which makes no sense
  //    */
  //   const parsedBodyResult = await newRequest.parseBody();
  //   Rhum.asserts.assertEquals(true, false);
  //   await o.close();
  // });

  Rhum.testCase(
    "Returns the default object when no boundary was found on multipart/form-data",
    async () => {
      const request = members.mockRequest("/orig", "post");
      const newRequest = new Drash.Http.Request(request);
      newRequest.headers.set("Content-Type", "multipart/form-data"); // Needed since the method gets boundary from header
      newRequest.headers.set("Content-Length", "883"); // Tells parseBody that this request has a body
      const result = await newRequest.parseBody();
      Rhum.asserts.assertEquals(result, {
        content_type: "",
        data: undefined,
      });
    },
  );

  Rhum.testCase(
    "Fails when cannot parse the body as multipart/form-data",
    async () => {
      const request = members.mockRequest("/orig", "post", {
        body: JSON.stringify({ name: "John" }),
      });
      const newRequest = new Drash.Http.Request(request);
      newRequest.headers.set(
        "Content-Type",
        "multipart/form-data; boundary=--------------------------434049563556637648550474",
      ); // Needed since the method gets boundary from header
      newRequest.headers.set("Content-Length", "883"); // Tells parseBody that this request has a body
      let hasErrored = false;
      let errorMessage = "";
      try {
        await newRequest.parseBody();
      } catch (err) {
        hasErrored = true;
        errorMessage = err.message;
      }
      Rhum.asserts.assertEquals(hasErrored, true);
      Rhum.asserts.assertEquals(
        errorMessage,
        "Error reading request body as multipart/form-data.",
      );
    },
  );

  Rhum.testCase("Can correctly parse as application/json", async () => {
    const encodedBody = new TextEncoder().encode(JSON.stringify({
      name: "John",
    }));
    const body = new Deno.Buffer(encodedBody as ArrayBuffer);
    const serverRequest = members.mockRequest("/", "post", {
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const request = new Drash.Http.Request(serverRequest);
    const ret = await request.parseBody();
    Rhum.asserts.assertEquals(ret, {
      content_type: "application/json",
      data: { name: "John" },
    });
  });

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
  Rhum.testCase("Can parse file sample_1.txt", async () => {
    const serverRequest = members.mockRequest();
    const request = new Drash.Http.Request(serverRequest);
    const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
    const form = await request.parseBodyAsMultipartFormData(
      o,
      "--------------------------434049563556637648550474",
      128,
    );
    Rhum.asserts.assertEquals(form.value("foo"), "foo");
    Rhum.asserts.assertEquals(form.value("bar"), "bar");
    let file = form.file("file");
    if (Array.isArray(file)) {
      file = file[0];
    }
    Rhum.asserts.assert(isFormFile(file));
    Rhum.asserts.assert(file!.content !== void 0);
    let file2 = form.file("file2");
    if (Array.isArray(file2)) {
      file2 = file2[0];
    }
    Rhum.asserts.assert(isFormFile(file2));
    Rhum.asserts.assert(file2!.filename === "中文.json");
    Rhum.asserts.assert(file2!.content !== void 0);
    o.close();
  });
  Rhum.testCase("Can parse file sample_2.txt", async () => {
    const serverRequest = members.mockRequest();
    const request = new Drash.Http.Request(serverRequest);
    const o = await Deno.open(path.resolve("./tests/data/sample_2.txt"));
    const form = await request.parseBodyAsMultipartFormData(
      o,
      "--------------------------434049563556637648550474",
      128,
    );
    Rhum.asserts.assertEquals(form.value("hello"), "world");
    o.close();
  });
  Rhum.testCase("Can parse file sample_3.txt", async () => {
    const serverRequest = members.mockRequest();
    const request = new Drash.Http.Request(serverRequest);
    const o = await Deno.open(path.resolve("./tests/data/sample_3.txt"));
    const form = await request.parseBodyAsMultipartFormData(
      o,
      "--------------------------434049563556637648550474",
      128,
    );
    Rhum.asserts.assertEquals(form.value("foo"), "foo");
    o.close();
  });
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
