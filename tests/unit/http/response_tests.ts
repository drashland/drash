import * as Drash from "../../../mod.ts";
import { assertEquals } from "../../deps.ts";
Deno.test("tests/unit/http/response_test.ts | setCookie()", () => {
  const response = new Drash.DrashResponse("", async (_r) => {});
  response.setCookie({
    name: "Repo",
    value: "Drash",
  });
  assertEquals(response.headers.get("Set-cookie"), "Repo=Drash");
});
Deno.test("send", () => {
  let sent = false;
  // deno-lint-ignore require-await
  const response = new Drash.DrashResponse("", async (_r) => {
    sent = true;
  });
  response.send();
  assertEquals(sent, true);
});
Deno.test("delCookie", () => {
  const response = new Drash.DrashResponse("", async (_r) => {});
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
