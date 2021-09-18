import {
  path,
  Rhum,
  TestHelpers,
  Buffer
} from "../../deps.ts";
import * as Drash from "../../../mod.ts"
import { parseBody } from "../../../src/http/request.ts"
const encoder = new TextEncoder();

Rhum.testPlan("http/request_test.ts", () => {
  Rhum.testSuite("accepts()", () => {
    acceptsTests();
  });

  Rhum.testSuite("getCookie()", () => {
    getCookieTests();
  });

  Rhum.testSuite("bodyParam()", () => {
    getBodyParamTests();
    getBodyFileTests();
  });

  Rhum.testSuite("pathParam()", () => {
    getPathParamTests();
  });

  Rhum.testSuite("queryParam()", () => {
    getUrlQueryParamTests();
  });

  Rhum.testSuite("parseBody()", () => {
    parseBodyTests();
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
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.DrashRequest(serverRequest, {}, new Map());
      let actual;
      actual = request.accepts(["application/json"]);
      Rhum.asserts.assertEquals("application/json", actual);
      actual = request.accepts(["text/html"]);
      Rhum.asserts.assertEquals("text/html", actual);
    },
  );
  Rhum.testCase(
    "rejects the single type if it is not present in the header",
    () => {
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.DrashRequest(serverRequest, {}, new Map());
      let actual;
      actual = request.accepts(["text/xml"]);
      Rhum.asserts.assertEquals(false, actual);
    },
  );
  Rhum.testCase(
    "accepts the first of multiple types if it is present in the header",
    () => {
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.DrashRequest(serverRequest, {}, new Map());
      let actual;
      actual = request.accepts(["application/json", "text/xml"]);
      Rhum.asserts.assertEquals("application/json", actual);
    },
  );
  Rhum.testCase(
    "accepts the second of multiple types if it is present in the header",
    () => {
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.DrashRequest(serverRequest, {}, new Map());
      let actual;
      actual = request.accepts(["text/xml", "application/json"]);
      Rhum.asserts.assertEquals("application/json", actual);
    },
  );
  Rhum.testCase(
    "rejects the multiple types if none are present in the header",
    () => {
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.DrashRequest(serverRequest, {}, new Map());
      let actual;
      actual = request.accepts(["text/xml", "text/plain"]);
      Rhum.asserts.assertEquals(false, actual);
    },
  );
}

function getCookieTests() {
  Rhum.testCase("Returns the cookie value if it exists", () => {
    const serverRequest = TestHelpers.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
        Cookie: "test_cookie=test_cookie_value",
        credentials: "include",
      },
    });
    const request = new Drash.DrashRequest(serverRequest, {}, new Map());
    const cookieValue = request.getCookie("test_cookie");
    Rhum.asserts.assertEquals(cookieValue, "test_cookie_value");
  });
  Rhum.testCase("Returns undefined if the cookie does not exist", () => {
    const serverRequest = TestHelpers.mockRequest("/", "get", {
      headers: {
        Accept: "application/json;text/html",
        Cookie: "test_cookie=test_cookie_value",
        credentials: "include",
      },
    });
    const request = new Drash.Request(serverRequest);
    const cookieValue = request.getCookie("cookie_doesnt_exist");
    Rhum.asserts.assertEquals(cookieValue, undefined);
  });
}

function getBodyFileTests() {
  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  Rhum.testCase("Returns the file object if the file exists", async () => {
    const serverRequest = TestHelpers.mockRequest();
    const request = new Drash.DrashRequest(serverRequest, {}, new Map());
    const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
    const form = await request.parseBodyAsMultipartFormData(
      o,
      "--------------------------434049563556637648550474",
      128,
    );
    const pb: Drash.Interfaces.IParsedRequestBody = {
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
    const serverRequest = TestHelpers.mockRequest();
    const request = new Drash.Request(serverRequest);
    const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
    const form = await request.parseBodyAsMultipartFormData(
      o,
      "--------------------------434049563556637648550474",
      128,
    );
    const pb: Drash.Interfaces.IParsedRequestBody = {
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
      const reader = new Buffer(body as ArrayBuffer);
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/json",
        },
        body: reader,
      });
      const parsedBody = await parseBody(serverRequest) ?? {};
      const request = new Drash.DrashRequest(serverRequest, parsedBody, new Map());
      const actual = request.bodyParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );
  Rhum.testCase("Returns null when the data doesn't exist", async () => {
    const body = encoder.encode(JSON.stringify({
      hello: "world",
    }));
    const reader = new Buffer(body);
    const serverRequest = TestHelpers.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    const parsedBody = await parseBody(serverRequest) ?? {};
    const request = new Drash.DrashRequest(serverRequest, parsedBody, new Map());
    const actual = request.bodyParam("dont_exist");
    Rhum.asserts.assertEquals(null, actual);
  });

  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  Rhum.testCase(
    "Returns the value for the parameter when it exists and request is multipart/form-data",
    async () => {
      const serverRequest = TestHelpers.mockRequest();
      const request = new Drash.Request(serverRequest);
      const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
      const form = await request.parseBodyAsMultipartFormData(
        o,
        "--------------------------434049563556637648550474",
        128,
      );
      const pb: Drash.Interfaces.IParsedRequestBody = {
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
    const reader = new Buffer(body as ArrayBuffer);
    const serverRequest = TestHelpers.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    const parsedBody = await parseBody(serverRequest) ?? {};
    const request = new Drash.DrashRequest(serverRequest, parsedBody, new Map());
    const actual = request.bodyParam("user");
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
    const reader = new Buffer(body);
    const serverRequest = TestHelpers.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    const parsedBody = await parseBody(serverRequest) ?? {};
    const request = new Drash.DrashRequest(serverRequest, parsedBody, new Map());
    const actual = request.bodyParam("usernames");
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
    const reader = new Buffer(body);
    const serverRequest = TestHelpers.mockRequest("/", "get", {
      headers: {
        "Content-Type": "application/json",
      },
      body: reader,
    });
    const parsedBody = await parseBody(serverRequest) ?? {};
    const request = new Drash.DrashRequest(serverRequest, parsedBody, new Map());
    const actual = request.bodyParam("authenticated");
    Rhum.asserts.assertEquals(actual, false);
    const authenticated = (actual as boolean);
    Rhum.asserts.assertEquals(authenticated, false);
  });
}

function getPathParamTests() {
  Rhum.testCase(
    "Returns the value for the header param when it exists",
    () => {
      const serverRequest = TestHelpers.mockRequest();
      const request = new Drash.DrashRequest(serverRequest, {}, new Map().set('hello', 'world'));
      const actual = request.pathParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );

  Rhum.testCase(
    "Returns null when the path param doesn't exist",
    () => {
      const serverRequest = TestHelpers.mockRequest();
      const request = new Drash.DrashRequest(serverRequest, {}, new Map().set('hello', 'world'));
      const actual = request.pathParam("dont-exist");
      Rhum.asserts.assertEquals(null, actual);
    },
  );
}

function getUrlQueryParamTests() {
  Rhum.testCase(
    "Returns the value for the query param when it exists",
    async () => {
      const serverRequest = TestHelpers.mockRequest("/?hello=world");
      const body = await parseBody(serverRequest) ?? {};
      const request = new Drash.DrashRequest(serverRequest, body, new Map());
      const actual = request.queryParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );

  Rhum.testCase(
    "Returns null when the query data doesn't exist",
    async () => {
      const serverRequest = TestHelpers.mockRequest("/?hello=world");
      const body = await parseBody(serverRequest) ?? {};
      const request = new Drash.DrashRequest(serverRequest, body, new Map());
      const actual = request.queryParam("dont_exist");
      Rhum.asserts.assertEquals(null, actual);
    },
  );
}

function parseBodyTests() {
  Rhum.testCase(
    "Returns the default object when request has no body",
    async () => {
      const serverRequest = TestHelpers.mockRequest("/");
      const ret = await parseBody(serverRequest);
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
      const reader = new Buffer(body);
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        body: reader,
      });
      const ret = await parseBody(serverRequest);
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
  //   const formOne = await new Drash.Request(TestHelpers.mockRequest())
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
  //   let originalRequest = TestHelpers.mockRequest("/orig", "post", {
  //     body: o,
  //   });
  //   const newRequest = new Drash.Request(originalRequest);
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
      const request = TestHelpers.mockRequest("/orig", "post");
      request.headers.set("Content-Type", "multipart/form-data"); // Needed since the method gets boundary from header
      request.headers.set("Content-Length", "883"); // Tells parseBody that this request has a body
      const result = await parseBody(request);
      Rhum.asserts.assertEquals(result, {
        content_type: "",
        data: undefined,
      });
    },
  );

  Rhum.testCase(
    "Fails when cannot parse the body as multipart/form-data",
    async () => {
      const request = TestHelpers.mockRequest("/orig", "post", {
        body: JSON.stringify({ name: "John" }),
      });
      request.headers.set(
        "Content-Type",
        "multipart/form-data; boundary=--------------------------434049563556637648550474",
      ); // Needed since the method gets boundary from header
      request.headers.set("Content-Length", "883"); // Tells parseBody that this request has a body
      let hasErrored = false;
      let errorMessage = "";
      try {
        await parseBody(request);
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
    const body = new Buffer(encodedBody);
    const serverRequest = TestHelpers.mockRequest("/", "post", {
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const ret = await parseBody(serverRequest);
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
        const serverRequest = TestHelpers.mockRequest("/", "post", {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "John",
          }),
        });
        const ret = await parseBody(serverRequest);
        Rhum.asserts.assertEquals(ret, {
          content_type: "application/json",
          data: { name: "John" },
        });
      } catch (_err) {
        errorThrown = true;
      }
      Rhum.asserts.assertEquals(errorThrown, true);
    },
  );

  Rhum.testCase(
    "Can correctly parse as application/x-www-form-urlencoded",
    async () => {
      const body = encoder.encode("hello=world");
      const reader = new Buffer(body as ArrayBuffer);
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: reader,
      });
      const ret = await parseBody(serverRequest);
      Rhum.asserts.assertEquals(ret, {
        content_type: "application/x-www-form-urlencoded",
        data: {
          hello: "world",
        },
      });
    },
  );
}
