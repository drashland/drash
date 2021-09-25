import * as Drash from "../../../mod.ts";
import { assertEquals } from "../../deps.ts";
Deno.test("tests/unit/http/response_test.ts | setCookie()", () => {
  const response = new Drash.DrashResponse(async (_r) => {});
  response.setCookie({
    name: "Repo",
    value: "Drash",
  });
  assertEquals(response.headers.get("Set-cookie"), "Repo=Drash");
});
Deno.test("send", () => {
  let sent = false;
  // deno-lint-ignore require-await
  const response = new Drash.DrashResponse(async (_r) => {
    sent = true;
  });
  response.send();
  assertEquals(sent, true);
});
Deno.test("delCookie", () => {
  const response = new Drash.DrashResponse(async (_r) => {});
  response.setCookie({
    name: "Repo",
    value: "Drash",
  });
  assertEquals(response.headers.get("Set-cookie"), "Repo=Drash");
  response.delCookie("Repo");
  assertEquals(
    response.headers.get("Set-cookie")?.includes("Repo=Drash, Repo=; Expires="),
    true,
  );
});
Deno.test("text()", () => {
  const response = new Drash.DrashResponse(async (_response) => {});
  response.text("hello");
  assertEquals(response.body, "hello");
  assertEquals(response.headers.get("content-type"), "text/plain");
});

Deno.test("html()", () => {
  const response = new Drash.DrashResponse(async (_response) => {});
  response.html("hello");
  assertEquals(response.body, "hello");
  assertEquals(response.headers.get("content-type"), "text/html");
});

Deno.test("xml()", () => {
  const response = new Drash.DrashResponse(async (_response) => {});
  response.xml("hello");
  assertEquals(response.body, "hello");
  assertEquals(response.headers.get("content-type"), "text/xml");
});

Deno.test("json()", () => {
  const response = new Drash.DrashResponse(async (_response) => {});
  response.json({ name: "Drash" });
  assertEquals(JSON.parse(response.body as string), { "name": "Drash" });
  assertEquals(response.headers.get("content-type"), "application/json");
});

Deno.test("file()", () => {
  const response = new Drash.DrashResponse(async (_response) => {});
  response.file("./tests/data/index.html");
  assertEquals(
    (response.body as string).startsWith(
      `This is the index.html file for testing pretty links`,
    ),
    true,
  );
  assertEquals(response.headers.get("content-type"), "text/html");
  response.file("./logo.svg");
  assertEquals(response.headers.get("content-type"), "image/svg+xml");
});
