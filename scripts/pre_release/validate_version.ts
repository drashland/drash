import { ConsoleLogger } from "../../src/standard/log/ConsoleLogger";

const logger = ConsoleLogger.create("validate_version.ts");

const versionToPublish = Deno.args[0];

const packageJsonContents = new TextDecoder().decode(
  Deno.readFileSync("./package.json"),
);

const packageJson = JSON.parse(packageJsonContents);
const packageJsonVersion = `v${packageJson.version}`;

logger.info("Checking package.json version with GitHub release tag version.\n");
logger.info(`packge.json version:    ${packageJsonVersion}`);
logger.info(`GitHub release version: ${versionToPublish}\n`);

if (packageJsonVersion !== versionToPublish) {
  logger.info("Version mismatch. Stopping Release workflow.");
  Deno.exit(1);
} else {
  logger.info("Versions match. Proceeding with Release workflow.");
}
