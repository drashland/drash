import { Rhum } from "../../test_deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("exceptions/name_collision_test.ts", () => {
  Rhum.testSuite("Exceptions.NameCollisionException('Error')", () => {
    Rhum.testCase("shows correct error message", () => {
      const actual = new Drash.Exceptions.NameCollisionException("Error");
      members.assertEquals(actual.message, "Error");
    });
  });
});

Rhum.run();
