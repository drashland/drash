import { assertEquals } from "../deps.ts";
import { DrashRequest } from "../../../../src/deno/http/drash_request.ts";

Deno.test("DrashRequest", async (t) => {
  await t.step("accepts()", async (t) => {
    await t.step("returns true if the content type is accepted", () => {
      const req = new Request("https://drash.land", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new DrashRequest(
        req,
      );
      let actual;
      actual = request.accepts("application/json");
      assertEquals(actual, true);
      actual = request.accepts("text/html");
      assertEquals(actual, true);
    });
    await t.step("returns false if the content type is not accepted", () => {
      const req = new Request("https://drash.land", {
        headers: {
          Accept: "application/json;text/html",
        },
      });
      const request = new DrashRequest(
        req,
      );
      const actual = request.accepts("text/xml");
      assertEquals(actual, false);
    });
  });

  await t.step("cookie()", async (t) => {
    await t.step("returns the cookie value if it exists", () => {
      const req = new Request("https://drash.land", {
        headers: {
          Accept: "application/json;text/html",
          Cookie: "test_cookie=test_cookie_value",
          credentials: "include",
        },
      });
      const request = new DrashRequest(
        req,
      );
      const cookieValue = request.cookie("test_cookie");
      assertEquals(cookieValue, "test_cookie_value");
    });
    await t.step("returns undefined if the cookie does not exist", () => {
      const req = new Request("https://drash.land", {
        headers: {
          Accept: "application/json;text/html",
          Cookie: "test_cookie=test_cookie_value",
          credentials: "include",
        },
      });
      const request = new DrashRequest(
        req,
      );
      const cookieValue = request.cookie("cookie_doesnt_exist");
      assertEquals(cookieValue, undefined);
    });
  });

  await t.step("headers.get()", async (t) => {
    await t.step("header returns value", () => {
      const serverRequest = new Request("https://drash.land");
      serverRequest.headers.set("hello", "world");
      const request = new DrashRequest(
        serverRequest,
      );
      const actual = request.headers.get("hello");
      assertEquals("world", actual);
    });
  });

  await t.step("pathParam()", async (t) => {
    await t.step("returns undefined when path param does not exist", () => {
      const serverRequest = new Request("https://drash.land");
      const request = new DrashRequest(
        serverRequest,
      );
      const actual = request.pathParam("dont-exist");
      assertEquals(actual, undefined);
    });
  });

  await t.step("queryParam()", async (t) => {
    await t.step("returns the value when it exists", () => {
      const serverRequest = new Request("https://drash.land/?hello=world");
      const request = new DrashRequest(
        serverRequest,
      );
      const actual = request.queryParam("hello");
      assertEquals(actual, "world");
    });

    await t.step("returns null when query param value does not exist", () => {
      const serverRequest = new Request("https://drash.land/?hello=world");
      const request = new DrashRequest(
        serverRequest,
      );
      const actual = request.queryParam("dont_exist");
      assertEquals(null, actual);
    });
  });
});
