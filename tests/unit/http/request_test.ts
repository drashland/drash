import { Rhum } from "../../deps.ts";
import * as Drash from "../../../mod.ts";
import type { ConnInfo } from "../../../deps.ts";

const connInfo: ConnInfo = {
  localAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 1337,
  },
  remoteAddr: {
    transport: "udp",
    hostname: "localhost",
    port: 1337,
  },
};

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
      const request = new Drash.Request(
        req,
        new Map(),
        connInfo,
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
      const request = new Drash.Request(
        req,
        new Map(),
        connInfo,
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
    const request = new Drash.Request(
      req,
      new Map(),
      connInfo,
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
    const request = new Drash.Request(
      req,
      new Map(),
      connInfo,
    );
    const cookieValue = request.getCookie("cookie_doesnt_exist");
    Rhum.asserts.assertEquals(cookieValue, undefined);
  });
}

function bodyTests() {
  Rhum.testCase("Can return multiple files", async () => {
    const formData = new FormData();
    const file1 = new Blob([
      new File([Deno.readFileSync("./mod.ts")], "mod.ts"),
    ], {
      type: "application/javascript",
    });
    const file2 = new Blob([
      new File([Deno.readFileSync("./mod.ts")], "mod.ts"),
    ], {
      type: "application/javascript",
    });
    formData.append("foo[]", file1, "mod.ts");
    formData.append("foo[]", file2, "mod2.ts");
    const serverRequest = new Request("https://drash.land", {
      headers: {
        // We use `"Content-Length": "1"` to tell Drash.Request that there is
        // a request body. This is a hack just for unit testing. In the real
        // world, the Content-Length header will be defined (at least it
        // should be) by the client.
        "Content-Length": "1",
      },
      body: formData,
      method: "POST",
    });
    const request = await Drash.Request.create(
      serverRequest,
      new Map(),
      connInfo,
    );

    Rhum.asserts.assertEquals(request.bodyParam("foo"), [
      {
        content: Deno.readFileSync("./mod.ts"),
        size: 1433,
        type: "application/javascript",
        filename: "mod.ts",
      },
      {
        content: Deno.readFileSync("./mod.ts"),
        size: 1433,
        type: "application/javascript",
        filename: "mod2.ts",
      },
    ]); // make sure that if a requets has multiple files, we can get each one eh <input type=file name=uploads[] />
  });

  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  Rhum.testCase("Returns the file object if the file exists", async () => {
    const formData = new FormData();
    const file = new Blob([
      new File([Deno.readFileSync("./logo.svg")], "logo.svg"),
    ], {
      type: "image/svg",
    });
    formData.append("foo", file, "logo.svg");
    const serverRequest = new Request("https://drash.land", {
      headers: {
        // We use `"Content-Length": "1"` to tell Drash.Request that there is
        // a request body. This is a hack just for unit testing. In the real
        // world, the Content-Length header will be defined (at least it
        // should be) by the client.
        "Content-Length": "1",
      },
      body: formData,
      method: "POST",
    });
    const request = await Drash.Request.create(
      serverRequest,
      new Map(),
      connInfo,
    );
    const bodyFile = request.bodyParam<Drash.Types.BodyFile>("foo") as any;
    Rhum.asserts.assertEquals(
      bodyFile.content,
      Deno.readFileSync("./logo.svg"),
    );
    Rhum.asserts.assertEquals(bodyFile.type, "image/svg");
    Rhum.asserts.assertEquals(bodyFile.filename, "logo.svg");
    Rhum.asserts.assertEquals(
      bodyFile.size > 3000 && bodyFile.size < 3200,
      true,
    ); // Should be 3099, but on windows it 3119, so just do a basic check on size to avoid bloated test code
  });

  Rhum.testCase(
    "Returns the value of a normal field for formdata requests",
    async () => {
      const formData = new FormData();
      formData.append("user", "Drash");
      const req = new Request("https://drash.land", {
        headers: {
          // We use `"Content-Length": "1"` to tell Drash.Request that there is
          // a request body. This is a hack just for unit testing. In the real
          // world, the Content-Length header will be defined (at least it
          // should be) by the client.
          "Content-Length": "1",
        },
        body: formData,
        method: "POST",
      });
      const request = await Drash.Request.create(
        req,
        new Map(),
        connInfo,
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
      headers: {
        // We use `"Content-Length": "1"` to tell Drash.Request that there is
        // a request body. This is a hack just for unit testing. In the real
        // world, the Content-Length header will be defined (at least it
        // should be) by the client.
        "Content-Length": "1",
      },
      body: formData,
      method: "POST",
    });
    const request = await Drash.Request.create(
      serverRequest,
      new Map(),
      connInfo,
    );
    Rhum.asserts.assertEquals(request.bodyParam("dontexist"), undefined);
  });
  Rhum.testCase(
    "Returns the value for the parameter when the data exists for application/json",
    async () => {
      const req = new Request("https://drash.land", {
        headers: {
          // We use `"Content-Length": "1"` to tell Drash.Request that there is
          // a request body. This is a hack just for unit testing. In the real
          // world, the Content-Length header will be defined (at least it
          // should be) by the client.
          "Content-Length": "1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hello: "world",
        }),
        method: "POST",
      });
      const request = await Drash.Request.create(
        req,
        new Map(),
        connInfo,
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
          // We use `"Content-Length": "1"` to tell Drash.Request that there is
          // a request body. This is a hack just for unit testing. In the real
          // world, the Content-Length header will be defined (at least it
          // should be) by the client.
          "Content-Length": "1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hello: "world",
        }),
        method: "POST",
      });
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );
      const actual = request.bodyParam("dont_exist");
      Rhum.asserts.assertEquals(undefined, actual);
    },
  );

  Rhum.testCase(
    "Returns the value for the parameter when it exists and request is multipart/form-data when using generics",
    async () => {
      const formData = new FormData();
      const file = new Blob([
        new File([Deno.readFileSync("./logo.svg")], "logo.svg"),
      ], {
        type: "image/svg",
      });
      formData.append("foo", file, "logo.svg");
      formData.append("user", "drash");
      const serverRequest = new Request("https://drash.land", {
        headers: {
          // We use `"Content-Length": "1"` to tell Drash.Request that there is
          // a request body. This is a hack just for unit testing. In the real
          // world, the Content-Length header will be defined (at least it
          // should be) by the client.
          "Content-Length": "1",
        },
        body: formData,
        method: "POST",
      });
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );
      const param = request.bodyParam<{
        content: string;
        filename: string;
        size: string;
        type: string;
      }>("foo");
      Rhum.asserts.assertEquals(
        param!.content,
        Deno.readFileSync("./logo.svg"),
      );
      Rhum.asserts.assertEquals(request.bodyParam("user"), "drash");
    },
  );
  // Before the date of 5th, Oct 2020, type errors were thrown for objects because the return value of `getBodyParam` was either a string or null
  Rhum.testCase("Can handle when a body param is an object", async () => {
    const serverRequest = new Request("https://drash.land", {
      headers: {
        // We use `"Content-Length": "1"` to tell Drash.Request that there is
        // a request body. This is a hack just for unit testing. In the real
        // world, the Content-Length header will be defined (at least it
        // should be) by the client.
        "Content-Length": "1",
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
    const request = await Drash.Request.create(
      serverRequest,
      new Map(),
      connInfo,
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
        // We use `"Content-Length": "1"` to tell Drash.Request that there is
        // a request body. This is a hack just for unit testing. In the real
        // world, the Content-Length header will be defined (at least it
        // should be) by the client.
        "Content-Length": "1",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usernames: ["Edward", "John Smith", "Lord Voldemort", "Count Dankula"],
      }),
      method: "POST",
    });
    const request = await Drash.Request.create(
      serverRequest,
      new Map(),
      connInfo,
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
        // We use `"Content-Length": "1"` to tell Drash.Request that there is
        // a request body. This is a hack just for unit testing. In the real
        // world, the Content-Length header will be defined (at least it
        // should be) by the client.
        "Content-Length": "1",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authenticated: false,
      }),
      method: "POST",
    });
    const request = await Drash.Request.create(
      serverRequest,
      new Map(),
      connInfo,
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
      const request = new Drash.Request(
        serverRequest,
        new Map().set("hello", "world"),
        connInfo,
      );
      const actual = request.pathParam("hello");
      Rhum.asserts.assertEquals("world", actual);
    },
  );

  Rhum.testCase(
    "Returns null when the path param doesn't exist",
    () => {
      const serverRequest = new Request("https://drash.land");
      const request = new Drash.Request(
        serverRequest,
        new Map().set("hello", "world"),
        connInfo,
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
      const request = new Drash.Request(
        serverRequest,
        new Map(),
        connInfo,
      );
      const actual = request.queryParam("hello");
      Rhum.asserts.assertEquals(actual, "world");
    },
  );

  Rhum.testCase(
    "Returns null when the query data doesn't exist",
    () => {
      const serverRequest = new Request("https://drash.land/?hello=world");
      const request = new Drash.Request(
        serverRequest,
        new Map(),
        connInfo,
      );
      const actual = request.queryParam("dont_exist");
      Rhum.asserts.assertEquals(undefined, actual);
    },
  );
}
