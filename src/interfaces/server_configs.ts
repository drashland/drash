import type { Drash } from "../../mod.ts";
import type { ServerMiddleware } from "./server_middleware.ts";

/**
 * Below are the configs explained in detail.
 *
 * logger?: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger
 *
 *     The server's logger. For example:
 *
 *         logger: new Drash.CoreLoggers.ConsoleLogger({
 *           enabled: true,
 *           level: "debug",
 *           tag_string: "{date} | {level} |",
 *           tag_string_fns: {
 *             date: function() {
 *               return new Date().toISOString().replace("T", " ");
 *             },
 *           },
 *         })
 *
 * memory_allocation?: {
 *   multipart_form_data?: number
 * }
 *     The amount of memory to allocate to certain parts of the codebase.
 *     For example, the multipart reader uses a default of 10MB, but you can
 *     override that default by specifying the following:
 *
 *         memory_allocation: {
 *           multipart_form_data: 128 // This would be translated to 128MB
 *         }
 *
 * middleware?: ServerMiddleware
 *
 *     The middleware that the server will execute during compile time and
 *     runtime.
 *
 *         middleware: {
 *           after_request: []
 *           before_request: []
 *           compile_time: []
 *         }
 *
 * resources?: Drash.Interfaces.Resource[]
 *
 *     An array of resources that the server should register. Passing in 0
 *     resources means clients can't access anything on the server--because
 *     there aren't any resources.
 *
 * response_output?: string
 *
 *     The fallback response Content-Type that the server should use. The
 *     response_output MUST be a proper MIME type. For example, the
 *     following would have the server default to JSON responses:
 *
 *         response_output: "application/json"
 */
export interface ServerConfigs {
  logger?: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger;
  memory_allocation?: { multipart_form_data?: number };
  middleware?: ServerMiddleware;
  resources?: Drash.Interfaces.Resource[];
  response_output?: string;
}
