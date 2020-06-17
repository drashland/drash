import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

members.testSuite("exceptions/http_response_exception_test.ts", () => {
  members.test("Exceptions.HttpResponseException(405) shows correct code and message", () => {
    const actual = new Drash.Exceptions.HttpResponseException(
      405,
      "HAAAAAA. Not allowed.",
    );
    members.assertEquals(actual.code, 405);
    members.assertEquals(actual.message, "HAAAAAA. Not allowed.");
  });

  members.test("Exceptions.HttpResponseException(418) shows correct code and message", () => {
    const actual = new Drash.Exceptions.HttpResponseException(
      418,
      "Yo... 418, bro.",
    );
    members.assertEquals(actual.code, 418);
    members.assertEquals(actual.message, "Yo... 418, bro.");
  });
});
