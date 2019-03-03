import members from "../members.ts";

members.test(function EnvVar_value() {
  let expected = "ical";

  members.Drash.setEnvVar("var1", expected);
  let actual = members.Drash.getEnvVar("var1").value;

  members.assert.equal(expected, actual);
});

members.test(function EnvVar_toArray_value() {
  let expected = {
    canon: "ical"
  };

  members.Drash.setEnvVar("var2", JSON.stringify(expected));
  let actual = members.Drash.getEnvVar("var2").toArray().value;

  members.assert.equal(expected, actual);
});
