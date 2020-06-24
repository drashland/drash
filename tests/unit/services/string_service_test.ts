import { Rhum } from "../../test_deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("services/string_service_test.ts", () => {
  Rhum.testSuite(
    "parseQueryParamsString()",
    () => {
      Rhum.testCase("Returns an empty object is no passed in string", () => {
        const result = Drash.Services.StringService.parseQueryParamsString("");
        Rhum.asserts.assertEquals(result, {});
      });
      Rhum.testCase("Returns invalid data if the querystring is incorrect", () => {
        const result = Drash.Services.StringService.parseQueryParamsString(
          "some_incorrect_data",
        );
        Rhum.asserts.assertEquals(result, {
          some_incorrect_data: undefined,
        });
      });

      Rhum.testCase("Returns the correct object when the querystring is correct", () => {
        const result = Drash.Services.StringService.parseQueryParamsString(
          "name=Edward&age=not_telling&drash=awesome",
        );
        Rhum.asserts.assertEquals(result, {
          name: "Edward",
          age: "not_telling",
          drash: "awesome",
        });
      });
    },
  );
});

Rhum.run();
