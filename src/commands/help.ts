import { CliService } from "../../deps.ts";
import { Drash } from "../../mod.ts";

export const help = CliService.createHelpMenu({
  description: `drash ${Drash.version}
    A REST microframework for Deno's HTTP server with zero dependencies`,
  usage: [
    "drash [SUBCOMMAND] [OPTIONS]",
  ],
  subcommands: {
    "help, --help": "Display the help menu",
    "version, --version": "Display Drash version",
    "make --resource=<path>": "Creates a resource class",
  },
  example_usage: [
    {
      description:
        "Creates a resource class named MyResource and writes to path",
      examples: [
        `drash make --resource=/path/to/my_resource.ts`,
      ],
    },
  ],
});
