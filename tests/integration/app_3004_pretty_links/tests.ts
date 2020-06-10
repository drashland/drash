import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

export const server = new Drash.Http.Server({
  directory: "./tests/integration/app_3004_pretty_links",
  response_output: "text/html",
  pretty_links: true,
  static_paths: ["/public"],
});

server.run({
  hostname: "localhost",
  port: 3004,
});

console.log(`Server listening: http://${server.hostname}:${server.port}`);
console.log("\nIntegration tests: testing server with pretty links.\n");

function getExpected() {
  if (Deno.build.os == "windows") {
    return `"Pretty links!

    `;
  }
  return "Pretty links!\n";
}

members.testSuite("pretty links", () => {
  members.test("/pretty/index.html converts to /pretty", async () => {
    const response = await members.fetch.get(
      "http://localhost:3004/public/pretty",
    );
    members.assertEquals(await response.text(), getExpected());
  });
});

Deno.test({
  name: "Stop the server",
  async fn() {
    await server.close();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
