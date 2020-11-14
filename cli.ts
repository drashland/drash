import { CliService } from "./deps.ts";
import { help } from "./src/commands/help.ts";
import { version } from "./src/commands/version.ts";
import { make } from "./src/commands/make.ts";

const cli = new CliService(Deno.args);

cli.addSubcommand(["help", "--help"], () => {
  console.log(help);
});

cli.addSubcommand(["version", "--version"], () => {
  console.log(version);
});

cli.addSubcommand("make", make, { requires_args: true });

cli.run();
