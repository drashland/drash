import { CliService } from "./deps.ts";
import { help } from "./src/commands/help.ts";
import { version } from "./src/commands/version.ts";
import { COMMAND_MAP } from "./src/commands/command_map.ts";

const cli = new CliService(Deno.args)

cli.addSubcommand(["-h", "--help"], () => {
  console.log(help);
});

cli.addSubcommand(["-v", "--version"], () => {
  console.log(version);
});

/**
 * Adds complex subcommands from COMMAND_MAP.
 */
Object.keys(COMMAND_MAP).forEach((cmd: string) => {
  cli.addSubcommand(
    cmd,
    (args: string[]) => {
      const [type, path] = args;
      if (COMMAND_MAP[cmd][type]) {
        COMMAND_MAP[cmd][type](path);
      } else {
        console.log(`command "${cmd} ${type}" does not exist`);
      }
    },
    { requires_args: true }
  );
});

cli.run();