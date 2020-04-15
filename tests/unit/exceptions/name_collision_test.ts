import members from "../../members.ts";

members.test("name_collision_test.ts | Exceptions.NameCollisionException('Error')", () => {
  let actual = new members.Drash.Exceptions.NameCollisionException("Error");
  members.assert.equal(actual.message, "Error");
});
