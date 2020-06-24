import { Rhum } from "../../test_deps.ts";
import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("exceptions/http_response_exception_test.ts", () => {
  Rhum.testSuite("Exceptions.HttpResponseException(405)", () => {
    Rhum.testCase("shows correct code and message", () => {
      const actual = new Drash.Exceptions.HttpResponseException(
        405,
        "HAAAAAA. Not allowed.",
      );
      members.assertEquals(actual.code, 405);
      members.assertEquals(actual.message, "HAAAAAA. Not allowed.");
    });
  });

  Rhum.testSuite("Exceptions.HttpResponseException(418)", () => {
    Rhum.testCase("shows correct code and message", () => {
      const actual = new Drash.Exceptions.HttpResponseException(
        418,
        "Yo... 418, bro.",
      );
      members.assertEquals(actual.code, 418);
      members.assertEquals(actual.message, "Yo... 418, bro.");
    });
  });
});

Rhum.run();
