import members from "../members.ts";

members.test(function EnvVar() {
  members.Drash.setEnvVar("canon", "ical");
  let actual = members.Drash.getEnvVar("canon");

  members.assert.equal("ical", actual);
});


