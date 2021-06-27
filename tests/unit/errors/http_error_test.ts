import { Drash, Rhum } from "../../deps.ts";

Rhum.testPlan("errors/http_error_test.ts", () => {
  Rhum.testSuite("Errors.HttpError(405) ", () => {
    Rhum.testCase("shows correct code and message", () => {
      const actual = new Drash.HttpError(
        405,
        "HAAAAAA. Not allowed.",
      );
      Rhum.asserts.assertEquals(actual.code, 405);
      Rhum.asserts.assertEquals(actual.message, "HAAAAAA. Not allowed.");
    });
  });

  Rhum.testSuite("Error.HttpError(418) ", () => {
    Rhum.testCase("shows correct code and message", () => {
      const actual = new Drash.HttpError(418, "Yo... 418, bro.");
      Rhum.asserts.assertEquals(actual.code, 418);
      Rhum.asserts.assertEquals(actual.message, "Yo... 418, bro.");
    });
  });
});

Rhum.run();
