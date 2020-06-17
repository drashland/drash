import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

members.testSuite(
  "services/string_service_test.ts | parseQueryParamsString()",
  () => {
    members.test("Returns an empty object is no passed in string", () => {
      const result = Drash.Services.StringService.parseQueryParamsString("");
      members.assertEquals(result, {});
    });
    members.test("Returns invalid data if the querystring is incorrect", () => {
      const result = Drash.Services.StringService.parseQueryParamsString(
        "some_incorrect_data",
      );
      members.assertEquals(result, {
        some_incorrect_data: undefined,
      });
    });

    members.test("Returns the correct object when the querystring is correct", () => {
      const result = Drash.Services.StringService.parseQueryParamsString(
        "name=Edward&age=not_telling&drash=awesome",
      );
      members.assertEquals(result, {
        name: "Edward",
        age: "not_telling",
        drash: "awesome",
      });
    });
  },
);
