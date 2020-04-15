import members from "../../members.ts";

members.test("http_exception_test.ts | Exceptions.HttpException(405)", () => {
  let actual = new members.Drash.Exceptions.HttpException(405);
  members.assert.equal(actual.code, 405);
});

members.test("http_exception_test.ts | Exceptions.HttpException(418)", () => {
  let actual = new members.Drash.Exceptions.HttpException(418);
  members.assert.equal(actual.code, 418);
});
