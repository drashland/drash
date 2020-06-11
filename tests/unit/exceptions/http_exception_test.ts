import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

members.testSuite("exceptions/http_exception_test.ts", () => {
  members.test("Exceptions.HttpException(405) shows correct code and message", () => {
    const actual = new Drash.Exceptions.HttpException(
      405,
      "HAAAAAA. Not allowed.",
    );
    members.assertEquals(actual.code, 405);
    members.assertEquals(actual.message, "HAAAAAA. Not allowed.");
  });

  members.test("Exceptions.HttpException(418) shows correct code and message", () => {
    const actual = new Drash.Exceptions.HttpException(418, "Yo... 418, bro.");
    members.assertEquals(actual.code, 418);
    members.assertEquals(actual.message, "Yo... 418, bro.");
  });
});
