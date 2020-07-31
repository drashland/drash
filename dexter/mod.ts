import { Drash } from "../deps.ts";

/**
 * See
 * https://doc.deno.land/https/deno.land/x/drash/src/interfaces/logger_configs.ts
 * for information on `Drash.Interfaces.LoggerConfigs`.
 *
 * response_time?: boolean
 *
 *     Are response times enabled?
 */
interface IDexterConfigs extends Drash.Interfaces.LoggerConfigs {
  response_time?: boolean;
}

/**
 * A logger middleware inspired by https://www.npmjs.com/package/morgan.
 *
 * @param configs - See IDexterConfigs
 */
export function Dexter(
  configs?: IDexterConfigs,
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
    if (!configs.enabled) {
      configs.enabled = defaultConfigs.enabled;
    }
    if (!configs.level) {
      configs.level = defaultConfigs.level;
    }
    if (!configs.tag_string) {
      configs.tag_string = defaultConfigs.tag_string;
    }
    if (!configs.tag_string_fns) {
      configs.tag_string_fns = defaultConfigs.tag_string_fns;
    }
  }

  configs = configs ?? defaultConfigs;

  const logger = new Drash.CoreLoggers.ConsoleLogger(configs);

  let timeStart: number;
  let timeEnd: number;

  /**
   * The middleware function that's called by Drash.
   *
   * @param request - The request object.
   * @param response - (optional) The response object.
   */
  function dexter(
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ): void {
    // If there is no response, then we know this is occurring before the request
    if (!response) {
      timeStart = new Date().getTime();
      // Replace predefined tags with their values
      if (configs!.tag_string) {
        let tagString = configs!.tag_string;
        if (tagString.includes("{request_method}")) {
          tagString = tagString.replace(
            "{request_method}",
            request.method.toUpperCase(),
          );
        }
        if (tagString.includes("{request_url}")) {
          tagString = tagString.replace("{request_url}", request.url);
        }
        configs!.tag_string = tagString;
      }
      logger.info(`Request received.`);
    }

    // If there is a response, then we know this is occurring after the request
    if (response) {
      timeEnd = new Date().getTime();
      let message = "Response sent.";
      if (configs!.response_time === true) {
        message += ` [${getTime(timeEnd, timeStart)}]`;
      }
      logger.info(message);
    }
  }

  // Expose the logger so that the logging functionality can be used freely by
  // the user
  dexter.logger = logger;

  // Expose the configs in case the user wants to do anything with them
  dexter.configs = configs;

  return dexter;
}

/**
 * Get the time it takes for the middleware to execute the
 * request-resource-response lifecycle in ms.
 *
 * @param end - The time at the point the response was sent.
 * @param start - The time at the point the request was received.
 *
 * @returns The time in ms as a string.
 */
function getTime(end: number, start: number): string {
  return `${end - start} ms`;
}
