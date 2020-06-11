import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

members.testSuite("exceptions/name_collision_test.ts", () => {
  members.test("Exceptions.NameCollisionException('Error')", () => {
    const actual = new Drash.Exceptions.NameCollisionException("Error");
    members.assertEquals(actual.message, "Error");
  });
});
