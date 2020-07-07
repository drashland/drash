import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("exceptions/name_collision_test.ts", () => {
  Rhum.testSuite("Exceptions.NameCollisionException('Error')", () => {
    Rhum.testCase("shows correct error message", () => {
      const actual = new Drash.Exceptions.NameCollisionException("Error");
      Rhum.asserts.assertEquals(actual.message, "Error");
    });
  });
});

Rhum.run();
