import members from "../../members.ts";

let exception = new members.Drash.Exceptions.HttpException(405);
let actual = exception.code;

members.test(function Resource() {
  members.assert.equal(actual, 405);
});
