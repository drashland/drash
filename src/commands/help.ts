import { CliService } from "../../deps.ts";

export const help = CliService.createHelpMenu({
  description:
    `Drash v1.3.0`,
  usage: [
    "drash [SUBCOMMAND] [OPTIONS]",
  ],
  subcommands: {
    "make resource /path/to/my_resource.ts": "Do something.",
    "help, --help": "Display the help menu.",
    "version, --version": "Display the version.",
  },
  options: {
    "do-something": {
      "--some-option":
        "Execute some option.",
    },
  },
  example_usage: [
    {
      description:
        "Do something and pass in an option.",
      examples: [
        `drash make resource`,
      ],
    },
    {
      description:
        "Display the help menu.",
      examples: [
        `drash help`,
        `drash --help`,
      ],
    },
  ],
});