import { Drash } from "../deps.ts";

/**
 * A logger middleware inspired by https://www.npmjs.com/package/morgan.
 *
 * @param configs - See https://deno.land/x/drash/src/interfaces/logger_configs.ts
 */
export function MorganLogger(configs?: Drash.Interfaces.LoggerConfigs) {
  const defaultConfigs = {
    enabled: true,
    level: "info",
    tag_string: "{datetime} | {level} |",
    tag_string_fns: {
      datetime() {
        return new Date().toISOString().replace("T", " ").split(".")[0];
      }
    }
  };

  if (configs) {
    if (!configs.hasOwnProperty("enabled")) {
      configs.enabled = defaultConfigs.enabled;
    }
    if (!configs.hasOwnProperty("level")) {
      configs.level = defaultConfigs.level;
    }
    if (!configs.hasOwnProperty("tag_string")) {
      configs.tag_string = defaultConfigs.tag_string;
    }
    if (!configs.hasOwnProperty("tag_string_fns")) {
      configs.tag_string_fns = defaultConfigs.tag_string_fns;
    }
  }

  const logger = new Drash.CoreLoggers.ConsoleLogger(
    configs ?? defaultConfigs
  );

  return (
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ) => {
    // If there is no response, then we know this is occurring before the request
    if (!response) {
      logger.info(`Request received: ${request.method} ${request.url}`);
    }
    // If there is a response, then we know this is occurring after the request
    if (response) {
      logger.info(
        `Response: ${response.status_code} ${response.getStatusMessage()}`,
      );
    }
  };
}
