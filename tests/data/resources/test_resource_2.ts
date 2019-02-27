import members from "../../../members.ts";

export default class TestResource2 extends members.Drash.Http.Resource() {
  static paths = ["/test-resource-2"];
}
