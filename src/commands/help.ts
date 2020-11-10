import { CliService } from "../../deps.ts";
import { Drash } from "../../mod.ts";

export const help = CliService.createHelpMenu({
  description:
    `drash ${Drash.version}
    "A REST microframework for Deno's HTTP server with zero dependencies"`,
  usage: [
    "drash [SUBCOMMAND] [OPTIONS]",
  ],
  options: {
    "-h, --help": "Display the help menu",
    "-v, --version": "Display the version",
  },
  subcommands: {
    "make --resource <path>": "Creates a resource class",
  },
  example_usage: [
    {
      description:
        "Creates a resource class named MyResource",
      examples: [
        `drash make --resource /path/to/my_resource.ts`,
      ],
    },
  ],
});