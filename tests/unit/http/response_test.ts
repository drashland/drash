import * as Drash from "../../../mod.ts";
import { assertEquals } from "../../deps.ts";
Deno.test("tests/unit/http/response_test.ts | setCookie()", () => {
  const response = new Drash.Response();
  response.setCookie({
    name: "Repo",
    value: "Drash",
  });
  assertEquals(response.headers.get("Set-cookie"), "Repo=Drash");
});
Deno.test("deleteCookie", () => {
  const response = new Drash.Response();
  response.setCookie({
    name: "Repo",
    value: "Drash",
  });
  assertEquals(response.headers.get("Set-cookie"), "Repo=Drash");
  response.deleteCookie("Repo");
  assertEquals(
    response.headers.get("Set-cookie")?.includes("Repo=Drash, Repo=; Expires="),
    true,
  );
});
Deno.test("text()", () => {
  const response = new Drash.Response();
  response.text("hello", 419, {
    user: "name",
  });
  assertEquals(response.body, "hello");
  assertEquals(response.headers.get("content-type"), "text/plain");
  assertEquals(response.status, 419);
  assertEquals(response.headers.get("user"), "name");
});

Deno.test("html()", () => {
  const response = new Drash.Response();
  response.html("hello", 419, {
    user: "name",
  });
  assertEquals(response.body, "hello");
  assertEquals(response.headers.get("content-type"), "text/html");
  assertEquals(response.status, 419);
  assertEquals(response.headers.get("user"), "name");
});

Deno.test("xml()", () => {
  const response = new Drash.Response();
  response.xml("hello", 419, {
    user: "name",
  });
  assertEquals(response.body, "hello");
  assertEquals(response.headers.get("content-type"), "text/xml");
  assertEquals(response.status, 419);
  assertEquals(response.headers.get("user"), "name");
});

Deno.test("json()", () => {
  const response = new Drash.Response();
  response.json({ name: "Drash" }, 419, {
    user: "name",
  });
  assertEquals(JSON.parse(response.body as string), { "name": "Drash" });
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(response.status, 419);
  assertEquals(response.headers.get("user"), "name");
});

Deno.test("file()", () => {
  const response = new Drash.Response();
  const filepath = Deno.cwd() + "/tests/data/index.html";
  response.file(filepath, 419, {
    user: "name",
  });
  assertEquals(
    (new TextDecoder().decode(response.body as Uint8Array)).startsWith(
      `This is the index.html file for testing pretty links`,
    ),
    true,
  );
  assertEquals(response.headers.get("content-type"), "text/html");
  response.file("./logo.svg");
  assertEquals(response.headers.get("content-type"), "image/svg+xml");
  assertEquals(response.headers.get("user"), "name");
});
