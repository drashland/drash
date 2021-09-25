import { Rhum } from "../../deps.ts";
import * as Drash from "../../../mod.ts";

Rhum.testPlan("http/request_test.ts", () => {
  Rhum.testSuite("accepts()", () => {
    acceptsTests();
  });

  Rhum.testSuite("getCookie()", () => {
    getCookieTests();
  });

  Rhum.testSuite("bodyParam()", () => {
    bodyTests();
  });

  Rhum.testSuite("pathParam()", () => {
    paramTests();
  });

  Rhum.testSuite("queryParam()", () => {
    queryTests();
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
      const req = new Request("https://drash.land", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.DrashRequest(
        req,
        new Map(),
        new URL("https://drash.land"),
      );
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
      const req = new Request("https://drash.land", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new Drash.DrashRequest(
        req,
        new Map(),
        new URL("https://drash.land"),
      );
      const actual = request.accepts("text/xml");
      Rhum.asserts.assertEquals(actual, false);
    },
  );
}

function getCookieTests() {
  Rhum.testCase("Returns the cookie value if it exists", () => {
    const req = new Request("https://drash.land", {
      headers: {
        Accept: "application/json;text/html",
        Cookie: "test_cookie=test_cookie_value",
        credentials: "include",
      },
    });
    const request = new Drash.DrashRequest(
      req,
      new Map(),
      new URL("https://drash.land"),
    );
    const cookieValue = request.getCookie("test_cookie");
    Rhum.asserts.assertEquals(cookieValue, "test_cookie_value");
  });
  Rhum.testCase("Returns undefined if the cookie does not exist", () => {
    const req = new Request("https://drash.land", {
      headers: {
        Accept: "application/json;text/html",
        Cookie: "test_cookie=test_cookie_value",
        credentials: "include",
      },
    });
    const request = new Drash.DrashRequest(
      req,
      new Map(),
      new URL("https://drash.land"),
    );
    const cookieValue = request.getCookie("cookie_doesnt_exist");
    Rhum.asserts.assertEquals(cookieValue, undefined);
  });
}

function bodyTests() {
  Rhum.testCase("Can return multiple files", async () => {
    const formData = new FormData();
    const file1 = new Blob([JSON.stringify({ hello: "world" }, null, 2)], {
      type: "application/json",
    });
    const file2 = new Blob([JSON.stringify({ hello: "world" }, null, 2)], {
      type: "application/json",
    });
    formData.append("foo[]", file1, "hello.json");
    formData.append("foo[]", file2, "world.json");
    const serverRequest = new Request("https://drash.land", {
      body: formData,
      method: "POST",
    });
    const request = await Drash.DrashRequest.create(
      serverRequest,
      new Map(),
      new URL("https://drash.land"),
    );
    Rhum.asserts.assertEquals(request.bodyParam("foo"), [
      {
        content: '{\n  "hello": "world"\n}',
        size: 22,
        type: "application/json",
        filename: "hello.json",
      },
      {
        content: '{\n  "hello": "world"\n}',
        size: 22,
        type: "application/json",
        filename: "world.json",
      },
    ]); // make sure that if a requets has multiple files, we can get each one eh <input type=file name=uploads[] />
  });

  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  Rhum.testCase("Returns the file object if the file exists", async () => {
    const formData = new FormData();
    const file = new Blob([JSON.stringify({ hello: "world" }, null, 2)], {
      type: "application/json",
    });
    formData.append("foo", file, "hello.json");
    const serverRequest = new Request("https://drash.land", {
      body: formData,
      method: "POST",
    });
    const request = await Drash.DrashRequest.create(
      serverRequest,
      new Map(),
      new URL("https://drash.land"),
    );
    Rhum.asserts.assertEquals(request.bodyParam("foo"), {
      content: '{\n  "hello": "world"\n}',
      size: 22,
      type: "application/json",
      filename: "hello.json",
    });
  });

  Rhum.testCase(
    "Returns the value of a normal field for formdata requests",
    async () => {
      const formData = new FormData();
      formData.append("user", "Drash");
      const req = new Request("https://drash.land", {
        body: formData,
        method: "POST",
      });
      const request = await Drash.DrashRequest.create(
        req,
        new Map(),
        new URL("https://drash.land"),
      );
      Rhum.asserts.assertEquals(request.bodyParam("user"), "Drash");
    },
  );

  Rhum.testCase("Returns undefined if the file does not exist", async () => {
    const formData = new FormData();
    const file = new Blob([JSON.stringify({ hello: "world" }, null, 2)], {
      type: "application/json",
    });
    formData.append("foo[]", file, "hello.json");
    const serverRequest = new Request("https://drash.land", {
      body: formData,
      method: "POST",
    });
    const request = await Drash.DrashRequest.create(
      serverRequest,
      new Map(),
      new URL("https://drash.land"),
    );
    Rhum.asserts.assertEquals(request.bodyParam("dontexist"), null);
  });
  Rhum.testCase(
    "Returns the value for the parameter when the data exists for application/json",
    async () => {
      const req = new Request("https://drash.land", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hello: "world",
        }),
        method: "POST",
      });
      const request = await Drash.DrashRequest.create(
        req,
        new Map(),
        new URL("https://drash.land"),
      );
      const actual = request.bodyParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );
  Rhum.testCase(
    "Returns null when the data doesn't exist for application/json",
    async () => {
      const serverRequest = new Request("https://drash.land", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hello: "world",
        }),
        method: "POST",
      });
      const request = await Drash.DrashRequest.create(
        serverRequest,
        new Map(),
        new URL("https://drash.land"),
      );
      const actual = request.bodyParam("dont_exist");
      Rhum.asserts.assertEquals(null, actual);
    },
  );

  Rhum.testCase(
    "Returns the value for the parameter when it exists and request is multipart/form-data when using generics",
    async () => {
      const formData = new FormData();
      const file = new Blob([JSON.stringify({ hello: "world" }, null, 2)], {
        type: "application/json",
      });
      formData.append("foo", file, "hello.json");
      formData.append("user", "drash");
      const serverRequest = new Request("https://drash.land", {
        body: formData,
        method: "POST",
      });
      const request = await Drash.DrashRequest.create(
        serverRequest,
        new Map(),
        new URL("https://drash.land"),
      );
      const param = request.bodyParam<{
        content: string;
        filename: string;
        size: string;
        type: string;
      }>("foo");
      Rhum.asserts.assertEquals(param!.content, '{\n  "hello": "world"\n}');
      Rhum.asserts.assertEquals(request.bodyParam("user"), "drash");
    },
  );
  // Before the date of 5th, Oct 2020, type errors were thrown for objects because the return value of `getBodyParam` was either a string or null
  Rhum.testCase("Can handle when a body param is an object", async () => {
    const serverRequest = new Request("https://drash.land", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          name: "Edward",
          location: "UK",
        },
      }),
      method: "POST",
    });
    const request = await Drash.DrashRequest.create(
      serverRequest,
      new Map(),
      new URL("https://drash.land"),
    );
    const actual = request.bodyParam<{
      name: string;
      location: string;
    }>("user")!;
    Rhum.asserts.assertEquals({
      name: "Edward",
      location: "UK",
    }, actual);
    const name = actual.name; // Ensuring we can access it and TS doesn't throw errors
    Rhum.asserts.assertEquals(name, "Edward");
  });
  Rhum.testCase("Can handle when a body param is an array", async () => {
    const serverRequest = new Request("https://drash.land", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernames: ["Edward", "John Smith", "Lord Voldemort", "Count Dankula"],
      }),
      method: "POST",
    });
    const request = await Drash.DrashRequest.create(
      serverRequest,
      new Map(),
      new URL("https://drash.land"),
    );
    const actual = request.bodyParam("usernames");
    Rhum.asserts.assertEquals(
      ["Edward", "John Smith", "Lord Voldemort", "Count Dankula"],
      actual,
    );
    const firstName = (actual as Array<string>)[0];
    Rhum.asserts.assertEquals(firstName, "Edward");
  });
  Rhum.testCase("Can handle when a body param is a boolean", async () => {
    const serverRequest = new Request("https://drash.land", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authenticated: false,
      }),
      method: "POST",
    });
    const request = await Drash.DrashRequest.create(
      serverRequest,
      new Map(),
      new URL("https://drash.land"),
    );
    const actual = request.bodyParam("authenticated");
    Rhum.asserts.assertEquals(actual, false);
    const authenticated = (actual as boolean);
    Rhum.asserts.assertEquals(authenticated, false);
  });
}

function paramTests() {
  Rhum.testCase(
    "Returns the value for the header param when it exists",
    () => {
      const serverRequest = new Request("https://drash.land");
      const request = new Drash.DrashRequest(
        serverRequest,
        new Map().set("hello", "world"),
        new URL("https://drash.land"),
      );
      const actual = request.pathParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );

  Rhum.testCase(
    "Returns null when the path param doesn't exist",
    () => {
      const serverRequest = new Request("https://drash.land");
      const request = new Drash.DrashRequest(
        serverRequest,
        new Map().set("hello", "world"),
        new URL("https://drash.land"),
      );
      const actual = request.pathParam("dont-exist");
      Rhum.asserts.assertEquals(actual, undefined);
    },
  );
}

function queryTests() {
  Rhum.testCase(
    "Returns the value for the query param when it exists",
    () => {
      const serverRequest = new Request("https://drash.land/?hello=world");
      const request = new Drash.DrashRequest(
        serverRequest,
        new Map(),
        new URL("https://drash.land/?hello=world"),
      );
      const actual = request.queryParam("hello");
      Rhum.asserts.assertEquals(actual, "world");
    },
  );

  Rhum.testCase(
    "Returns null when the query data doesn't exist",
    () => {
      const serverRequest = new Request("https://drash.land/?hello=world");
      const request = new Drash.DrashRequest(
        serverRequest,
        new Map(),
        new URL("https://drash.land/?hello=world"),
      );
      const actual = request.queryParam("dont_exist");
      Rhum.asserts.assertEquals(null, actual);
    },
  );
}
