import members from "../members.ts";

class SomeCoolService {
  public coolify() {
    return "OK!";
  }
}

members.Drash.addMember("SomeCoolService", SomeCoolService);

members.test(async function Drash_addApplication() {
  let expected = "OK!";
  let service = new members.Drash.Vendor.SomeCoolService();
  members.assert.equal(service.coolify(), expected);
});
