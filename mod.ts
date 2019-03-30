// Core
import EnvVar from "./src/core/env_var.ts";
// Compilers
import DocBlocksToJson from "./src/compilers/doc_blocks_to_json.ts";
// Dictionaries
import LogLevels from "./src/dictionaries/log_levels.ts";
import MimeDb from "https://raw.githubusercontent.com/jshttp/mime-db/master/db.json";
// Exceptions
import HttpException from "./src/exceptions/http_exception.ts";
// Http
import Request from "./src/http/request.ts";
import Resource from "./src/http/resource.ts";
import Response from "./src/http/response.ts";
import Server from "./src/http/server.ts";
// Loggers
import Logger from "./src/loggers/logger.ts";
import ConsoleLogger from "./src/loggers/console_logger.ts";
import CoreLogger from "./src/loggers/core_logger.ts";
import FileLogger from "./src/loggers/file_logger.ts";
// Services
import HttpService from "./src/services/http_service.ts";
// Util
import * as Util from "./src/util.ts";

////////////////////////////////////////////////////////////////////////////////
// DRASH ///////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function Drash(): any {
  let Drash = {
    Compilers: {
      DocBlocksToJson: DocBlocksToJson
    },
    Dictionaries: {
      LogLevels: LogLevels,
      MimeDb: MimeDb
    },
    Exceptions: {
      HttpException: HttpException
    },
    Http: {
      Request: Request,
      Response: Response,
      Resource: Resource,
      Server: Server
    },
    Loggers: {
      Logger: Logger,
      ConsoleLogger: ConsoleLogger,
      FileLogger: FileLogger
    },
    Members: {},
    Services: {
      HttpService: HttpService
    },
    Util: Util,

    /**
     * @property CoreLogger core_logger
     */
    core_logger: new CoreLogger({
      enabled: Deno.env().DRASH_CORE_LOGGER_ENABLED === "true",
      level: Deno.env().DRASH_CORE_LOGGER_LEVEL,
      tag_string: "{level} |"
    }),

    /**
     * Add an app to the Members namespace. After adding an app, you can use the
     * app via `Drash.Members.YourApp.doSomething()`.
     *
     * @param string name
     *     The app's name which can be accessed via `Drash.Members[name]`.
     * @param any app
     *     The app.
     */
    addMember(name: string, app: any) {
      this.core_logger.debug(
        `Add member "${name}" to Drash.Members namespace.`
      );
      this.Members[name] = app;
    },

    /**
     * Set an environment variable in `Deno.env()`.
     *
     * @param string variableName
     *     The variable name.
     *
     * @return EnvVar
     *     Returns a new EnvVar object with helper functions. For example, if
     *     the value of the environment variable is a JSON string, you can call
     *     `.toArray().value` to turn it into a parsable JSON array before
     *     retrieving the actual value.
     */
    getEnvVar(variableName: string): EnvVar {
      let exists = Deno.env().hasOwnProperty(variableName);
      let value;

      value = exists ? Deno.env()[variableName] : undefined;

      return new EnvVar(variableName, value);
    },

    /**
     * Set an environment variable in `Deno.env()`.
     *
     * @param string variableName
     *     The variable name which can be accessed via
     *     `Drash.getEnvVar(variableName)`.
     * @param string value
     *     The value of the variable. `Deno.env()` only accepts strings. See
     *     https://deno.land/typedoc/index.html#env for more info.
     *
     * @return void
     */
    setEnvVar(variableName: string, value: string): void {
      if (!Deno.env()[variableName]) {
        Deno.env()[variableName] = value;
      }
    }
  }; // close return

  if (Deno.env().DRASH_CORE_LOGGER_ENABLED === "true") {
    Drash.core_logger.debug("Drash.core_logger is enabled.");
    Drash.core_logger.debug(
      `Drash.core_logger.level is set to: ${
        Deno.env().DRASH_CORE_LOGGER_LEVEL
      }.`
    );
  }

  return Drash;
}
export default Drash();
