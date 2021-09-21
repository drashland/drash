import { Prototype } from "../../../mod.ts";
import { assertEquals } from "../../deps.ts";

Deno.test("tests/unit/gurus/prototype_test.ts | Should clone an obejct", () => {
  const obj = {
    name: "Drash",
  };
  const clone = Prototype.clone(obj);
  assertEquals(clone, {
    name: "Drash",
  });
});
