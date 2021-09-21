import { Buffer, path, Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts";
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
  });

  Rhum.testSuite("pathParam()", () => {
    getPathParamTests();
  });

  Rhum.testSuite("queryParam()", () => {
    getUrlQueryParamTests();
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
      const request = new Drash.DrashRequest(serverRequest, new Map());
      let actual;
      actual = request.accepts("application/json");
      Rhum.asserts.assertEquals(actual, true);
      actual = request.accepts("text/html");
      Rhum.asserts.assertEquals(actual, true);
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
      const request = new Drash.DrashRequest(serverRequest, new Map());
      let actual;
      actual = request.accepts("text/xml");
      Rhum.asserts.assertEquals(actual, false);
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
    const request = new Drash.DrashRequest(serverRequest, new Map());
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
    const request = new Drash.DrashRequest(serverRequest, new Map());
    const cookieValue = request.getCookie("cookie_doesnt_exist");
    Rhum.asserts.assertEquals(cookieValue, undefined);
  });
}

function getBodyParamTests() {
  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  Rhum.testCase("Returns the file object if the file exists", async () => {
    const serverRequest = TestHelpers.mockRequest();
    const request = new Drash.DrashRequest(serverRequest, new Map());
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
      const request = await Drash.DrashRequest.create(serverRequest, new Map());
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
    const request = await Drash.DrashRequest.create(serverRequest, new Map());
    const actual = request.bodyParam("dont_exist");
    Rhum.asserts.assertEquals(null, actual);
  });

  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  Rhum.testCase(
    "Returns the value for the parameter when it exists and request is multipart/form-data",
    async () => {
      const o = await Deno.open(path.resolve("./tests/data/sample_1.txt"));
      const form = await request.parseBodyAsMultipartFormData(
        o,
        "--------------------------434049563556637648550474",
        128,
      );
      const serverRequest = TestHelpers.mockRequest("/", "get", {
        body: form,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const request = await Drash.DrashRequest.create(serverRequest, new Map());
      Rhum.asserts.assertEquals(request.bodyParam("foo"), "foo");
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
    const request = await Drash.DrashRequest.create(serverRequest, new Map());
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
    const request = await Drash.DrashRequest.create(serverRequest, new Map());
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
    const request = await Drash.DrashRequest.create(serverRequest, new Map());
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
      const request = new Drash.DrashRequest(
        serverRequest,
        new Map().set("hello", "world"),
      );
      const actual = request.pathParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );

  Rhum.testCase(
    "Returns null when the path param doesn't exist",
    () => {
      const serverRequest = TestHelpers.mockRequest();
      const request = new Drash.DrashRequest(
        serverRequest,
        new Map().set("hello", "world"),
      );
      const actual = request.pathParam("dont-exist");
      Rhum.asserts.assertEquals(null, actual);
    },
  );
}

function getUrlQueryParamTests() {
  Rhum.testCase(
    "Returns the value for the query param when it exists",
    () => {
      const serverRequest = TestHelpers.mockRequest("/?hello=world");
      const request = new Drash.DrashRequest(serverRequest, new Map());
      const actual = request.queryParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );

  Rhum.testCase(
    "Returns null when the query data doesn't exist",
    () => {
      const serverRequest = TestHelpers.mockRequest("/?hello=world");
      const request = new Drash.DrashRequest(serverRequest, new Map());
      const actual = request.queryParam("dont_exist");
      Rhum.asserts.assertEquals(null, actual);
    },
  );
}
