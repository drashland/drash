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

let ThirdParty = {};

function Drash(): any {
  return {
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

    addApplication(name, application) {
      this.Vendor[name] = application;
    },
  };
}
export default Drash();
