import { DrashResponse } from "../../mod.ts";
import { assertEquals, ejsRender, etaRender, test } from "../deps.ts";

test("Response initial status should be equal to two hundred", function () {
  const response = new DrashResponse();

  assertEquals(response.status, 200);
});

test("Response status should be equal to four hundred", function () {
  const response = new DrashResponse();
  response.status = 400;

  assertEquals(response.status, 400);
});

test("Response initial statusText should be equal to 'OK'", function () {
  const response = new DrashResponse();

  assertEquals(response.statusText, "OK");
});

test("Response statusText should be equal to 'Bad Request'", function () {
  const response = new DrashResponse();
  response.status = 400;

  assertEquals(response.statusText, "Bad Request");
});

test("Response initial headers size should be equal to zero", function () {
  const response = new DrashResponse();

  assertEquals(Array.from(response.headers).length, 0);
});

test("Response headers size should be equal to one", function () {
  const response1 = new DrashResponse();
  response1.setHeader("content-type", "application/json");

  assertEquals(Array.from(response1.headers).length, 1);

  const response2 = new DrashResponse();
  response2.setHeader("content-type", "application/json");
  response2.setHeader("content-type", "");

  assertEquals(Array.from(response2.headers).length, 1);
});

test("Response headers size should be equal to two", function () {
  const response = new DrashResponse();
  response.setHeader("content-type", "application/json");
  response.setHeader("accept", "application/json");

  assertEquals(Array.from(response.headers).length, 2);
});

test("Response initial headers should be equal to a new Headers", function () {
  const headers = new Headers();
  const response = new DrashResponse();
  assertEquals(headers, response.headers);
});

test("Response headers should be equal to a custom Headers", function () {
  const headers = new Headers();
  headers.set("content-type", "application/json");
  headers.set("accept", "application/json");
  const response = new DrashResponse();
  response.setHeader("content-type", "application/json");
  response.setHeader("accept", "application/json");
  assertEquals(headers, response.headers);
});

test("Response headers key should be removed", function () {
  const response = new DrashResponse();
  response.setHeader("content-type", "application/json");
  response.setHeader("accept", "application/json");
  assertEquals(Array.from(response.headers).length, 2);
  response.deleteHeader("accept");
  assertEquals(Array.from(response.headers).length, 1);
});

test("Response initial cookies should be empty", function () {
  const response = new DrashResponse();
  assertEquals(response.headers.has("set-cookie"), false);
});

test("Response cookies should be 'foo=bar'", function () {
  const response = new DrashResponse();
  response.setCookie({
    name: "foo",
    value: "bar",
  });
  assertEquals(response.headers.get("set-cookie"), "foo=bar");
});

test("Response cookies should be 'foo=bar, hello-world'", function () {
  const response = new DrashResponse();
  response.setCookie({
    name: "foo",
    value: "bar",
  });
  response.setCookie({
    name: "hello",
    value: "world",
  });
  assertEquals(response.headers.get("set-cookie"), "foo=bar, hello=world");
});

test(`Response cookies should be 'foo=bar, hello=world; Expires=${new Date(0).toUTCString()}'`, function () {
  const response = new DrashResponse();
  response.setCookie({
    name: "foo",
    value: "bar",
  });
  response.deleteCookie("hello");
  assertEquals(
    response.headers.get("set-cookie"),
    `foo=bar, hello=; Expires=${new Date(0).toUTCString()}`,
  );
});

test("Response initial body should be empty", function () {
  const response = new DrashResponse();

  assertEquals(response.body, "");
});

test("Response body should be changed to 'hello world'", function () {
  const response = new DrashResponse();
  response.body = "hello world";

  assertEquals(response.body, "hello world");
});

test("Response render function with Eta", async function () {
  const response = new DrashResponse();

  async function render(template: string, object: Record<string, unknown>) {
    const renderedText = await etaRender(template, object);
    return renderedText as string;
  }
  const newResponse = await response.render(render, "Hi <%= it.name %>", {
    name: "Person",
  });

  assertEquals(newResponse.body, "Hi Person");
  assertEquals(newResponse.headers.get("content-type"), "text/html");
});

test("Response render function with EJS", async function () {
  const response = new DrashResponse();

  async function render(template: string, object: Record<string, unknown>) {
    const renderedText = await ejsRender(template, object);
    return renderedText as string;
  }
  const newResponse = await response.render(render, "Hi <%= name %>", {
    name: "Person",
  });

  assertEquals(newResponse.body, "Hi Person");
  assertEquals(newResponse.headers.get("content-type"), "text/html");
});
