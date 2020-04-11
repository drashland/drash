import Drash from "../../mod.ts";

/**
 * @memberof Drash.Interfaces
 * @interface ServerConfigs
 *
 * @description
 *     address?: string
 *
 *         The hostname and port that the server will run on. For example,
 *
 *             address: "localhost:1337"
 *
 *     directory?: string
 *
 *         The path to the directory of the server on the filesystem.  This is
 *         used when resolving static paths, so make sure you have this set
 *         correctly if you are serving static paths.
 *
 *     logger?: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger
 *
 *         The server's logger.
 *
 *     memory_allocation?: {
 *       multipart_form_data?: number
 *     }
 *         How much memory should be allocated to certain parts of the codebase.
 *         For example, the multipart reader uses a default of 10MB, but you can
 *         override that default by specifying the following:
 *
 *             memory_allocation: {
 *               multipart_form_data: 128 // Would be translated to 128MB
 *             }
 *
 *     middleware?: any
 *
 *         The middleware that the server should use. Server-level middleware
 *         should be placed in middleware.server_level. Resource-level
 *         middleware should be placed in middleware.resource_level. For
 *         example,
 *
 *             middleware: {
 *               resource_level: { ... },
 *               server_level: { ... }
 *             }
 *
 *     pretty_links?: boolean
 *
 *         Enabling pretty links allows your Drash server to check whether or
 *         not an index.html file exists in a static directory. For example, if
 *         /public/app/index.html exists, then you can go to /public/app and it
 *         will serve the index.html in that static directory.
 *
 *     resources: any
 *
 *         An array of resources that the server should register. Passing in 0
 *         resources means clients can't access anything on the server--because
 *         there aren't any resources.
 *
 *     response_output?: string
 *
 *         The fallback response Content-Type that the server should use. For
 *         example, the following would have the server default to JSON
 *         responses. The response_output MUST be a proper MIME type.
 *
 *             response_output: "application/json"
 *
 *     static_paths?: string[]
 *
 *         An array of static paths. Static paths are made public to clients.
 *         This means they can access anything in static paths. For example, if
 *         you have /public as a static path, then clients can look at things
 *         under your /path/to/your/server/public directory.
 */
export interface ServerConfigs {
  address?: string;
  directory?: string;
  logger?: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger;
  memory_allocation?: { multipart_form_data?: number };
  middleware?: any;
  pretty_links?: boolean;
  resources: any;
  response_output?: string;
  static_paths?: string[];
}
