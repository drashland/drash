import { Drash } from "../deps.ts";

interface IMorganConfigs extends Drash.Interfaces.LoggerConfigs {
  response_time?: boolean;
}

/**
 * A logger middleware inspired by https://www.npmjs.com/package/morgan.
 *
 * @param configs - See https://doc.deno.land/https/deno.land/x/drash/src/interfaces/logger_configs.ts
 */
export function Morgan(
  configs?: IMorganConfigs
) {
  const defaultConfigs = {
    enabled: true,
    level: "info",
    tag_string: "{datetime} | {level} |",
    tag_string_fns: {
      datetime() {
        return new Date().toISOString().replace("T", " ").split(".")[0];
      },
    },
  };

  // If configs are passed in, make sure (at the very least) that the following
  // configs are present:
  // - enabled
  // - level
  // - tag_string
  // - tag_string_fns
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

  configs = configs ?? defaultConfigs

  const logger = new Drash.CoreLoggers.ConsoleLogger(configs);

  Morgan.prototype.configs = configs;
  Morgan.prototype.logger = logger;
  let timeStart: number;
  let timeEnd: number;

  return (
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ) => {

    // If there is no response, then we know this is occurring before the request
    if (!response) {
      timeStart = new Date().getTime();
      // Replace predefined tags with their values
      if (configs!.tag_string) {
        let tagString = configs!.tag_string;
        if (tagString.includes("{request_method}")) {
          tagString = tagString.replace("{request_method}", request.method.toUpperCase());
        }
        if (tagString.includes("{request_url}")) {
          tagString = tagString.replace("{request_url}", request.url);
        }
        configs!.tag_string = tagString;
      }
      logger.info(`Rquest received.`);
    }

    // If there is a response, then we know this is occurring after the request
    if (response) {
      timeEnd = new Date().getTime();
      let message = "Response sent.";
      if (configs!.response_time === true) {
        message += ` ${getTime(timeEnd, timeStart)}`;
      }
      logger.info(message);
    }
  };
}

function getTime(end: number, start: number): string {
  return `${end - start} ms`;
}
