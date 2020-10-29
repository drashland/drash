import { Rhum } from "../../test_deps.ts";
import { Tengine } from "../mod.ts";
import { Drash } from "../../deps.ts";
import * as eta from "https://deno.land/x/eta@v1.6.0/mod.ts";

const tengine = Tengine({
  render: async (args: any[]): Promise<string|void> => {
    const path = Deno.realPathSync(".") + "/tengine/tests" + args[0];

    const content = await eta.render(
      new TextDecoder().decode(Deno.readFileSync(path)),
      args[1],
      args[2],
      args[3]
    );

    return content;

  }
});

class Resource extends Drash.Http.Resource {
  static paths = ["/"];
  public async GET() {
    try {
      this.response.body = await this.getMiddleware("tengine").render("/index.eta", { greeting: "hello" });
    } catch (error) {
      console.log(error);
    }
    return this.response;
  }
}

// deno-lint-ignore no-explicit-any
async function runServer(
  tengine: any, // eg `const paladin = new Paladin()`, imported from paladin/mod.ts
  port: number,
): Promise<Drash.Http.Server> {
  const server = new Drash.Http.Server({
    response_output: "text/html",
    resources: [Resource],
    middleware: {
      after_request: [
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
