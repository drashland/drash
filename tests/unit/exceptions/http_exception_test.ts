import members from "../../members.ts";

members.test(function Exceptions_HttpException() {
  let actual = new members.Drash.Exceptions.HttpException(405);
  members.assert.equal(actual.code, 405);
});

members.test(function Exceptions_HttpMiddlewareException() {
  let actual = new members.Drash.Exceptions.HttpException(418);
  members.assert.equal(actual.code, 418);
});
