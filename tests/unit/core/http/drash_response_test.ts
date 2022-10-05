import { assertEquals } from "../deps.ts";
import { ResponseBuilder } from "../../../../src/core/http/response_builder.ts";

Deno.test("ResponseBuilder", async (t) => {
  await t.step("cookies()", async (t) => {
    await t.step("Sets cookies on Set-cookie header", async () => {
      const response = new ResponseBuilder();
      response.cookies({
        "Repo": {
          value: "Drash",
        },
      });
      const nativeResponse = await response.toNativeResponse();
      assertEquals(nativeResponse.headers.get("Set-cookie"), "Repo=Drash");
    });
  });

  await t.step("deleteCookies()", async (t) => {
    await t.step(`Deletes cookies by setting cookie attributes`, async () => {
      const response = new ResponseBuilder();
      response.cookies({
        "Repo": {
          value: "Drash",
        },
      });
      const nativeResponse = await response.toNativeResponse();
      assertEquals(nativeResponse.headers.get("Set-cookie"), "Repo=Drash");
      response.deleteCookies(["Repo"]);
      assertEquals(
        response.headers_init?.get("Set-cookie")?.includes(
          "Repo=; Expires=",
        ),
        true,
      );
    });
  });

  await t.step("html()", async (t) => {
    await t.step("sets text/html header and html body", async () => {
      const response = new ResponseBuilder();
      response.html("hello");
      const nativeResponse = await response.toNativeResponse();
      assertEquals(await nativeResponse.text(), "hello");
      assertEquals(nativeResponse.headers.get("content-type"), "text/html");
    });
  });

  await t.step("json()", async (t) => {
    await t.step("sets application/json and json body", async () => {
      const response = new ResponseBuilder();
      response.json({ name: "Drash" });
      const nativeResponse = await response.toNativeResponse();
      assertEquals(await nativeResponse.json(), { "name": "Drash" });
      assertEquals(
        nativeResponse.headers.get("content-type"),
        "application/json",
      );
    });
  });

  await t.step("text()", async (t) => {
    await t.step("sets text/plain header and text body", async () => {
      const response = new ResponseBuilder();
      response.text("hello");
      const nativeResponse = await response.toNativeResponse();
      assertEquals(await nativeResponse.text(), "hello");
      assertEquals(nativeResponse.headers.get("content-type"), "text/plain");
    });
  });

  await t.step("xml()", async (t) => {
    await t.step("set text/xml header and xml body", async () => {
      const response = new ResponseBuilder();
      response.xml("hello");
      const nativeResponse = await response.toNativeResponse();
      assertEquals(await nativeResponse.text(), "hello");
      assertEquals(nativeResponse.headers.get("content-type"), "text/xml");
    });
  });
});
