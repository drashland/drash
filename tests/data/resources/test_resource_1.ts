import members from "../../../members.ts";

export default class TestResource1 extends members.Drash.Http.Resource() {
  static paths = ["/test-resource-1"];
}
