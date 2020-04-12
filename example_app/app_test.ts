import members from "../tests/members.ts";
import server from "./app_server.ts";
server.run({ address: "localhost:1667" });

import "./coffee_resource_test.ts";
import "./cookie_resource_test.ts";
import "./files_resource_test.ts";
import "./home_resource_test.ts";
import "./middleware_resource_test.ts";
import "./users_resource_test.ts";


members.test("config.pretty_links", async () => {
  let response = await members.fetch.get("http://localhost:1667/public/pretty");
  members.assert.equals(await response.text(), "Pretty links!\n");
});

await Deno.runTests();

server.close();
