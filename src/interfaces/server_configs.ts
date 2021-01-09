import type { Drash } from "../../mod.ts";
import type { ServerMiddleware } from "./server_middleware.ts";

/**
 * Contains the type of ServerConfigs
 * @remarks
 * directory?: string
 *
 *     The path to the directory of the server on the filesystem.  This is
 *     used when resolving static paths, so make sure you have this set
 *     correctly if you are serving static paths. A quick way to implement
 *     this could be the following:
 *
 *         directory: `${await Deno.realpath('.')}`
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
 * pretty_links?: boolean
 *
 *     Enabling pretty links allows your Drash server to check whether or
 *     not an index.html file exists in a static directory. For example, if
 *     /public/app/index.html exists, then you can go to /public/app and it
 *     will serve the index.html in that static directory.
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
 *
 * static_paths?: string[]
 *
 *     An array of static paths. Static paths are made public to clients.
 *     This means they can access anything in static paths. For example, if
 *     you have /public as a static path, then clients can look at things
 *     under your /path/to/your/server/public directory.
 */
export interface ServerConfigs {
  directory?: string;
  logger?: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger;
  memory_allocation?: { multipart_form_data?: number };
  middleware?: ServerMiddleware;
  pretty_links?: boolean;
  resources?: Drash.Interfaces.Resource[];
  response_output?: string;
  static_paths?: string[] | { [key: string]: string };
}
