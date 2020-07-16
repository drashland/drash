import { Rhum } from "../../test_deps.ts";
import { Armor } from "../mod.ts";

Rhum.testPlan("Armor - mod_test.ts", () => {
  Rhum.testSuite("X-XSS-Protection Header", () => {
    Rhum.testCase("Sets the header by Default", () => {
      const armor = Armor()
    })
    Rhum.testCase("Sets the header when config is true", () => {

    })
  })
})