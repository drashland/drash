// Compilers
import * as TemplateEngine from "./src/compilers/template_engine.ts";

// Dictionaries
import HttpStatusCodes from "./src/dictionaries/http_status_codes.ts";
import LogLevels from "./src/dictionaries/log_levels.ts";
import MimeDb from "https://raw.githubusercontent.com/jshttp/mime-db/master/db.json";
// Exceptions
import HttpException from "./src/exceptions/http_exception.ts";
// Http
import Resource from "./src/http/resource.ts";
import Response from "./src/http/response.ts";
import Server from "./src/http/server.ts";
// Loggers
import Logger from "./src/loggers/logger.ts";
import ConsoleLogger from "./src/loggers/console_logger.ts";
// Services
import * as HttpService from "./src/services/http_service.ts";
// Util
import * as Util from "./src/util.ts";

class EnvVar {
  public value;
  protected name;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }

  /**
   * Convert an env var to a JSON array.
   *
   * @return this
   */
  public toArray() {
    this.value = JSON.parse(this.value);
    return this;
  }
}

function Drash(): any {
  return {
    Compilers: {
      TemplateEngine: TemplateEngine
    },
    Dictionaries: {
      HttpStatusCodes: HttpStatusCodes,
      LogLevels: LogLevels,
      MimeDb: MimeDb
    },
    Exceptions: {
      HttpException: HttpException
    },
    Http: {
      Response: Response,
      Resource: Resource,
      Server: Server
    },
    Loggers: {
      Logger: Logger,
      ConsoleLogger: ConsoleLogger
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
     * Set an environment variable in `Deno.env()`. The environment variable will be converted to an
     * uppercase string and prefixed with "DRASH_." For example, if `Drash.setEnvVar("test", "ok")`
     * is called, then this function will set the environment variable as `DRASH_TEST`.

     * @param string variableName
     *     The variable name which can be accessed via `Drash.getEnvVar(variableName)`.
     * @param string value
     *     The value of the variable. `Deno.env()` only accepts strings. See
     *     https://deno.land/typedoc/index.html#env for more info.
     *
     * @return void
     */
    setEnvVar(variableName:string, value: string): void {
      let key = `DRASH_${variableName.toUpperCase()}`;
      if (!Deno.env()[key]) {
        Deno.env()[key] = value;
      }
    },

    /**
     * Set an environment variable in `Deno.env()`.
     * @param string variableName
     *     The variable name.
     *
     * @return EnvVar
     *     Returns a new EnvVar object with helper functions. For example, if the value of the
     *     environment variable is a JSON string, you can call `.toArray()` to turn it into a
     *     parsable JSON array.
     */
    getEnvVar(variableName: string): EnvVar {
      let key = `DRASH_${variableName.toUpperCase()}`;
      let exists = Deno.env().hasOwnProperty(key);
      let value;

      value = exists
        ? Deno.env()[key]
        : undefined;

      return new EnvVar(key, value);
    }
  };
}
export default Drash();
