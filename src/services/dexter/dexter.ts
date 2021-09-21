import { ConsoleLogger, LoggerConfigs } from "./deps.ts";
import { Service, IService, IContext } from "../../../mod.ts";

/**
 * See
 * https://doc.deno.land/https/deno.land/x/drash/src/interfaces/logger_configs.ts
 * for information on `Drash.Interfaces.LoggerConfigs`.
 *
 * response_time?: boolean
 *
 *     Are response times enabled?
 */
interface IDexterConfigs {
  // deno-lint-ignore camelcase
  response_time?: boolean;
  url?: boolean;
  datetime?: boolean;
  method?: boolean;
  enabled?: boolean
}

/**
 * A logger middleware inspired by https://www.npmjs.com/package/morgan.
 *
 * @param configs - See IDexterConfigs
 *
 * @example
 * ```ts
 * const dexter = Dexter()
 * const dexter = Dexter({
 *  response_time: true,
 *
 * })
 * ```
 */
export class DexterService extends Service implements IService {

    public configs: IDexterConfigs

     #timeEnd = 0

     #timeStart = 0

    public logger: ConsoleLogger

    constructor(configs: IDexterConfigs = {}) {
        super()
        configs = {
            datetime: configs.datetime || true,
            url: configs.url || false,
            method: configs.method || false,
            response_time: configs.response_time || false,
            enabled: configs.enabled === undefined ? true : configs.enabled
        }
        this.configs = configs
        const loggerConfigs: LoggerConfigs = {
            // deno-lint-ignore camelcase
            tag_string: "",
            // deno-lint-ignore camelcase
            tag_string_fns: {},
          };
          // If a user has defined specific strings we allow, ensure they are set before we had it off to unilogger to process into a log statement
          if (configs?.datetime !== false) {
            loggerConfigs.tag_string += "{datetime} |";
            loggerConfigs.tag_string_fns!.datetime = () =>
              new Date().toISOString().replace("T", " ").split(".")[0];
          }
      
          this.logger = new ConsoleLogger(loggerConfigs);
    }

    runBeforeResource(context: IContext) {
      if (this.configs.enabled === false) {
        return
      }
      this.#timeStart = new Date().getTime();
      let message = "Request received"
      if (this.configs.url) {
        message = context.request.url + ' | ' + message
      }
      if (this.configs.method) {
        message = context.request.method.toUpperCase + ' | ' + message
      }
      this.logger.info(message);
    }

    runAfterResource(context: IContext) {
      if (!this.configs.response_time) {
        return
      }
      if (this.configs.enabled === false) {
        return
      }
      this.#timeEnd = new Date().getTime();
      let message = "Response sent [" + getTime(this.#timeEnd, this.#timeStart) + "]"
      if (this.configs.url) {
        message = context.request.url + ' | ' + message
      }
      if (this.configs.method) {
        message = context.request.method.toUpperCase + ' | ' + message
      }
      this.logger.info(message);
    }
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