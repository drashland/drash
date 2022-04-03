import { Service } from "../../../mod.ts";
import { assertEquals } from "../../deps.ts";

class MyService extends Service {
  runBeforeResource() {
    this.end();
  }
}

Deno.test("unit/http.service_test.ts | end() ", () => {
  const s = new MyService();
  s.runBeforeResource();
  assertEquals(s.end_lifecycle, true);
});
