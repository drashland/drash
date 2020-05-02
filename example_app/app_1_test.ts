import members from "../tests/members.ts";

import "./coffee_resource_test.ts";
import "./cookie_resource_test.ts";
import "./files_resource_test.ts";
import "./home_resource_test.ts";
import "./middleware_resource_test.ts";
import "./request_accepts_resource_test.ts";
import "./request_accepts_two_resource_test.ts";
import "./template_engine_null_data_resource_test.ts";
import "./template_engine_resource_test.ts";
import "./users_resource_test.ts";

members.test("config.pretty_links", async () => {
  let response = await members.fetch.get("http://localhost:1667/public/pretty");
  members.assert.equals(await response.text(), "Pretty links!\n");
});
