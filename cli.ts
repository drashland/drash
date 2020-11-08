import { CliService } from "./deps.ts";
import { help } from "./src/commands/help.ts";
import { makeResource } from "./src/commands/make_resource.ts";

const cli = new CliService(Deno.args)

const COMMAND_MAPPER: { [key: string]: any } = {
  "make": {
    resource: makeResource
  }
};

cli.addSubcommand(["help", "--help"], () => {
  console.log(help);
});

Object.keys(COMMAND_MAPPER).forEach((cmd: string) => {
  cli.addSubcommand(
    cmd,
    (args: string[]) => {
      const [type, path] = args;
      if (COMMAND_MAPPER[cmd][type]) {
        COMMAND_MAPPER[cmd][type](path);
      } else {
        console.log(`command "${cmd} ${type}" does not exist`);
      }
    },
    { requires_args: true }
  );
})

cli.run();