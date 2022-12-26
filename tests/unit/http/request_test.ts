import { assertEquals } from "../../deps.ts";
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

Deno.test("http/request_test.ts", async (t) => {
  await t.step("original", async (t) => {
    await originalRequestTests(t);
  });

  await t.step("accepts()", async (t) => {
    await acceptsTests(t);
  });

  await t.step("getCookie()", async (t) => {
    await getCookieTests(t);
  });

  await t.step("bodyParam()", async (t) => {
    await bodyTests(t);
  });

  await t.step("pathParam()", async (t) => {
    await paramTests(t);
  });

  await t.step("queryParam()", async (t) => {
    await queryTests(t);
  });

  await t.step("static create()", async (t) => {
    await staticCreateTests(t);
  });
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TEST CASES ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

async function acceptsTests(t: Deno.TestContext) {
  await t.step(
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
      assertEquals(actual, true);
      actual = request.accepts("text/html");
      assertEquals(actual, true);
    },
  );
  await t.step(
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
      assertEquals(actual, false);
    },
  );
}

async function getCookieTests(t: Deno.TestContext) {
  await t.step("Returns the cookie value if it exists", () => {
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
    assertEquals(cookieValue, "test_cookie_value");
  });
  await t.step("Returns undefined if the cookie does not exist", () => {
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
    assertEquals(cookieValue, undefined);
  });
}

async function bodyTests(t: Deno.TestContext) {
  await t.step("Can return multiple files", async () => {
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

    // make sure that if a requets has multiple files, we can get each one eh <input type=file name=uploads[] />
    const size = Deno.build.os === "windows" ? 1471 : 1433;
    const file = request.bodyParam<Drash.Types.BodyFile[]>("foo") ?? [];
    assertEquals(file[0].content, Deno.readFileSync("./mod.ts"));
    assertEquals(file[0].size, size);
    assertEquals(file[0].type, "application/javascript");
    assertEquals(file[0].filename, "mod.ts");
    assertEquals(file[1].content, Deno.readFileSync("./mod.ts"));
    assertEquals(file[1].size, size);
    assertEquals(file[1].type, "application/javascript");
    assertEquals(file[1].filename, "mod2.ts");
  });

  // Reason: `this.request.getBodyParam()` didn't work for multipart/form-data requests
  await t.step("Returns the file object if the file exists", async () => {
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
    // deno-lint-ignore no-explicit-any
    const bodyFile = request.bodyParam<Drash.Types.BodyFile>("foo") as any;
    assertEquals(
      bodyFile.content,
      Deno.readFileSync("./logo.svg"),
    );
    assertEquals(bodyFile.type, "image/svg");
    assertEquals(bodyFile.filename, "logo.svg");
    assertEquals(
      bodyFile.size > 3000 && bodyFile.size < 3200,
      true,
    ); // Should be 3099, but on windows it 3119, so just do a basic check on size to avoid bloated test code
  });

  await t.step(
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
      assertEquals(request.bodyParam("user"), "Drash");
    },
  );

  await t.step("Returns undefined if the file does not exist", async () => {
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
    assertEquals(request.bodyParam("dontexist"), undefined);
  });
  await t.step(
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
      assertEquals("world", actual);
    },
  );
  await t.step(
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
      assertEquals(undefined, actual);
    },
  );

  await t.step(
    "Should be consistent with falsey return values (null value returns null)",
    async () => {
      // This test case was added due to https://github.com/drashland/drash/issues/623

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
          foo: null,
        }),
        method: "POST",
      });
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );
      const body = request.bodyAll() as {
        foo: null;
      };
      assertEquals(body, { foo: null });
      assertEquals(body["foo"], null);
      assertEquals(request.bodyParam("foo"), null);
      // As an edge case check, make sure bodyAll() returns the expected
      assertEquals(
        (request.bodyAll() as Partial<{ foo: unknown }>)["foo"],
        null,
      );
    },
  );

  await t.step(
    "Should be consistent with falsey return values (false value returns false)",
    async () => {
      // This test case was added due to https://github.com/drashland/drash/issues/623

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
          foo: false,
        }),
        method: "POST",
      });
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );
      const body = request.bodyAll() as Partial<{
        foo: unknown;
      }>;
      assertEquals(body, { foo: false });
      assertEquals(body["foo"], false);
      assertEquals(request.bodyParam("foo"), false);
      // As an edge case check, make sure bodyAll() returns the expected
      assertEquals(
        (request.bodyAll() as Partial<{ foo: unknown }>)["foo"],
        false,
      );
    },
  );

  await t.step(
    "Should be consistent with falsey return values (undefined value returns undefined)",
    async () => {
      // This test case was added due to https://github.com/drashland/drash/issues/623

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
          foo: undefined,
        }),
        method: "POST",
      });
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );
      const body = request.bodyAll() as Partial<{
        foo: unknown;
      }>;
      assertEquals(body, {});
      assertEquals(body["foo"], undefined);
      assertEquals(request.bodyParam("foo"), undefined);
      // As an edge case check, make sure bodyAll() returns the expected
      assertEquals(
        (request.bodyAll() as Partial<{ foo: unknown }>)["foo"],
        undefined,
      );
    },
  );

  await t.step(
    "Should be consistent with falsey return values (no value returns undefined)",
    async () => {
      // This test case was added due to https://github.com/drashland/drash/issues/623

      const serverRequest = new Request("https://drash.land", {
        headers: {
          // We use `"Content-Length": "1"` to tell Drash.Request that there is
          // a request body. This is a hack just for unit testing. In the real
          // world, the Content-Length header will be defined (at least it
          // should be) by the client.
          "Content-Length": "1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        method: "POST",
      });
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );
      const body = request.bodyAll() as Partial<{
        foo: unknown;
      }>;
      assertEquals(body, {});
      assertEquals(body["foo"], undefined);
      assertEquals(request.bodyParam("foo"), undefined);
      // As an edge case check, make sure bodyAll() returns the expected
      assertEquals(
        (request.bodyAll() as Partial<{ foo: unknown }>)["foo"],
        undefined,
      );
    },
  );

  await t.step(
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
        content: Uint8Array;
        filename: string;
        size: string;
        type: string;
      }>("foo");
      assertEquals(
        param!.content,
        Deno.readFileSync("./logo.svg"),
      );
      assertEquals(request.bodyParam("user"), "drash");
    },
  );
  // Before the date of 5th, Oct 2020, type errors were thrown for objects because the return value of `getBodyParam` was either a string or null
  await t.step("Can handle when a body param is an object", async () => {
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
    assertEquals({
      name: "Edward",
      location: "UK",
    }, actual);
    const name = actual.name; // Ensuring we can access it and TS doesn't throw errors
    assertEquals(name, "Edward");
  });
  await t.step("Can handle when a body param is an array", async () => {
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
    assertEquals(
      ["Edward", "John Smith", "Lord Voldemort", "Count Dankula"],
      actual,
    );
    const firstName = (actual as Array<string>)[0];
    assertEquals(firstName, "Edward");
  });
  await t.step("Can handle when a body param is a boolean", async () => {
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
    assertEquals(actual, false);
    const authenticated = (actual as boolean);
    assertEquals(authenticated, false);
  });
}

async function originalRequestTests(t: Deno.TestContext) {
  await t.step(
    "body is kept intact when Drash.Request body is parsed",
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

      // When creating a Drash.Request object, the body is automatically parsed
      // and causes `Drash.Request.bodyUsed` to be `true`
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );

      // Check that the Drash.Request body has the `hello` param
      const hello = request.bodyParam("hello");
      assertEquals(hello, "world");

      // Check that the original request body was kept intact
      assertEquals(request.bodyUsed, true);
      assertEquals(request.original.bodyUsed, false);
      // Now read the original request body
      assertEquals(await request.original.json(), { hello: "world" });
    },
  );

  await t.step(
    "can be retrieved via request.original and has { bodyUsed: false }",
    async () => {
      // We expect this to be cloned in the `Drash.Request.create()` call
      const serverRequest = new Request("https://drash.land", {
        headers: { "x-hello": "goodbye", "x-goodbye": "hello" },
        method: "POST",
        redirect: "error",
      });

      // When creating a Drash.Request object, the body is automatically parsed
      // and causes `Drash.Request.bodyUsed` to be `true`
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );

      // Assert some equality between the two requests
      assertEquals(request.original.bodyUsed, serverRequest.bodyUsed);
      assertEquals(request.original.headers, serverRequest.headers);
      assertEquals(request.original.method, serverRequest.method);
      assertEquals(request.original.redirect, serverRequest.redirect);
      assertEquals(request.original.url, serverRequest.url);
    },
  );
}

async function paramTests(t: Deno.TestContext) {
  await t.step(
    "Returns the value for the header param when it exists",
    () => {
      const serverRequest = new Request("https://drash.land");
      const request = new Drash.Request(
        serverRequest,
        new Map().set("hello", "world"),
        connInfo,
      );
      const actual = request.pathParam("hello");
      assertEquals("world", actual);
    },
  );

  await t.step(
    "Returns null when the path param doesn't exist",
    () => {
      const serverRequest = new Request("https://drash.land");
      const request = new Drash.Request(
        serverRequest,
        new Map().set("hello", "world"),
        connInfo,
      );
      const actual = request.pathParam("dont-exist");
      assertEquals(actual, undefined);
    },
  );
}

async function queryTests(t: Deno.TestContext) {
  await t.step(
    "Returns the value for the query param when it exists",
    () => {
      const serverRequest = new Request("https://drash.land/?hello=world");
      const request = new Drash.Request(
        serverRequest,
        new Map(),
        connInfo,
      );
      const actual = request.queryParam("hello");
      assertEquals(actual, "world");
    },
  );

  await t.step(
    "Returns null when the query data doesn't exist",
    () => {
      const serverRequest = new Request("https://drash.land/?hello=world");
      const request = new Drash.Request(
        serverRequest,
        new Map(),
        connInfo,
      );
      const actual = request.queryParam("dont_exist");
      assertEquals(undefined, actual);
    },
  );
}

async function staticCreateTests(t: Deno.TestContext) {
  await t.step(
    "option { read_body: false } keeps body intact",
    async () => {
      const serverRequest = new Request("https://drash.land", {
        headers: {
          // We use `"Content-Length": "1"` to tell Drash.Request that there is
          // a request body. This is a hack just for unit testing. In the real
          // world, the Content-Length header will be defined (at least it
          // should be) by the client.
          //
          // Since we are passing in { read_body: false }, the body should not
          // be read regardless of Content-Length being 1.
          "Content-Length": "1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hello: "world",
        }),
        method: "POST",
      });

      // This call should cause the body to be left intact.
      // `DrashRequest.parseBody()` should not be called.
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
        {
          read_body: false,
        },
      );

      // Assert the bodies have not been read
      assertEquals(request.bodyUsed, false);
      assertEquals(request.original.bodyUsed, false);

      // Now read the original request body
      assertEquals(await request.original.json(), { hello: "world" });
    },
  );

  await t.step(
    "empty POST body does not throw an error",
    async () => {
      const serverRequest = new Request("https://drash.land", {
        method: "POST",
      });

      // This call should cause the body to be left intact.
      // `DrashRequest.parseBody()` should not be called.
      const request = await Drash.Request.create(
        serverRequest,
        new Map(),
        connInfo,
      );

      // Assert the bodies have not been read
      assertEquals(request.bodyUsed, false);
      assertEquals(request.original.bodyUsed, false);

      // Now read the bodies
      assertEquals(await request.text(), "");
      // This should work because the above call should not affect the original
      assertEquals(await request.original.text(), "");
      // The body should be null for both according to spec
      // (https://developer.mozilla.org/en-US/docs/Web/API/Request/body). Body
      // contents should not have been added to the requests, so null is what we
      // should expect.
      assertEquals(request.body, null);
      assertEquals(request.original.body, null);
    },
  );
}
