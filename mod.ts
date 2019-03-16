// Random Classes
import EnvVar from "./src/classes/env_var.ts";

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
import FileLogger from "./src/loggers/file_logger.ts";
// Services
import * as HttpService from "./src/services/http_service.ts";
// Util
import * as Util from "./src/util.ts";

////////////////////////////////////////////////////////////////////////////////
// DRASH ///////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function Drash(): any {
  return {
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
    Services: {
      HttpService: HttpService
    },
    Util: Util,
    Vendor: {},

    /**
     * Add a new member to the Vendor namespace.
     *
     * @param string name
     *     The member's name which can be accessed via `Drash.Vendor[name]`.
     * @param any member
     */
    addMember(name: string, member: any) {
      this.Vendor[name] = member;
    },

    /**
     * Set an environment variable in `Deno.env()`.

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
}
export default Drash();
