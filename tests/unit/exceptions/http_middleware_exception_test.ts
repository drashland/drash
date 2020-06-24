import { Rhum } from "../../test_deps.ts";
import { Drash } from "../../../mod.ts";

Rhum.testPlan("exceptions/http_middleware_exception_test.ts", () => {
  Rhum.testSuite("Exceptions.HttpMiddlewareException(405)", () => {
    Rhum.testCase("shows correct code and message", () => {
      const actual = new Drash.Exceptions.HttpMiddlewareException(
        405,
        "HAAAAAA. Not allowed.",
      );
      Rhum.asserts.assertEquals(actual.code, 405);
      Rhum.asserts.assertEquals(actual.message, "HAAAAAA. Not allowed.");
    });
  });

  Rhum.testSuite("Exceptions.HttpMiddlewareException(418)", () => {
    Rhum.testCase("shows correct code and message", () => {
      const actual = new Drash.Exceptions.HttpMiddlewareException(
        418,
        "Yo... 418, bro.",
      );
      Rhum.asserts.assertEquals(actual.code, 418);
      Rhum.asserts.assertEquals(actual.message, "Yo... 418, bro.");
    });
  });
});

Rhum.run();
