import { Drash } from "../../deps.ts";
import { Rhum } from "../../test_deps.ts";
import { Tengine } from "../mod.ts";

class Resource extends Drash.Http.Resource {
  static paths = ["/"];
  public async GET() {
    this.response.body = this.response.render(
      "/index.html",
      { greeting: "hello" },
    );
    return this.response;
  }
}

const tengine = Tengine({
  render: (...args: unknown[]): boolean => {
    return false; // This render method returns false to tell Tengine to use Jae
  },
  views_path: "./tengine/tests/views",
});

// deno-lint-ignore no-explicit-any
async function runServer(
  tengine: any, // eg `const paladin = new Paladin()`, imported from paladin/mod.ts
  port: number,
): Promise<Drash.Http.Server> {
  const server = new Drash.Http.Server({
    response_output: "text/html",
    resources: [Resource],
    middleware: {
      after_resource: [
        tengine,
      ],
    },
  });
  await server.run({
    hostname: "localhost",
    port: port,
  });
  return server;
}

runServer(tengine, 1337);
