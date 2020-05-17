// Compilers
import { TemplateEngine as BaseTemplateEngine } from "./src/compilers/template_engine.ts";

// Decorators
import {
  Middleware as MiddlewareHandler,
  MiddlewareFunction as MiddlewareFunctionDefinition,
  MiddlewareType as MiddlewareTypeDefinition,
} from "./src/http/middleware.ts";

// Dictionaries
import * as log_levels from "./src/dictionaries/log_levels.ts";
import { mime_db } from "./src/dictionaries/mime_db.ts";

// Exceptions
import { HttpException as BaseHttpException } from "./src/exceptions/http_exception.ts";
import { HttpMiddlewareException as BaseHttpMiddlewareException } from "./src/exceptions/http_middleware_exception.ts";
import { HttpResponseException as BaseHttpResponseException } from "./src/exceptions/http_response_exception.ts";
import { NameCollisionException as BaseNameCollisionException } from "./src/exceptions/name_collision_exception.ts";

// Http
import { Middleware as BaseMiddleware } from "./src/http/middleware.ts";
import { Resource as BaseResource } from "./src/http/resource.ts";
import { Response as BaseResponse } from "./src/http/response.ts";
import { Server as BaseServer } from "./src/http/server.ts";

// Interfaces
import { LoggerConfigs as BaseLoggerConfigs } from "./src/interfaces/logger_configs.ts";
import { LogLevelStructure as BaseLogLevelStructure } from "./src/interfaces/log_level_structure.ts";
import { ParsedRequestBody as BaseParsedRequestBody } from "./src/interfaces/parsed_request_body.ts";
import { ServerConfigs as BaseServerConfigs } from "./src/interfaces/server_configs.ts";
import { ResponseOptions as BaseResponseOptions } from "./src/interfaces/response_options.ts";

// Loggers
import { Logger as BaseLogger } from "./src/core_loggers/logger.ts";
import { ConsoleLogger as BaseConsoleLogger } from "./src/core_loggers/console_logger.ts";
import { FileLogger as BaseFileLogger } from "./src/core_loggers/file_logger.ts";

// Services
import { HttpService as BaseHttpService } from "./src/services/http_service.ts";
import { HttpRequestService as BaseHttpRequestService } from "./src/services/http_request_service.ts";
import { StringService as BaseStringService } from "./src/services/string_service.ts";

export namespace Drash {
  /**
   * @description
   *     Drash version. Also represents what Deno version is
   *     supported.
   *
   * @property string version
   */
  export const version: string = "v1.0.0";

  export namespace Compilers {
    export class TemplateEngine extends BaseTemplateEngine {}
  }

  export namespace Dictionaries {
    export const LogLevels = log_levels.LogLevels;
    export const MimeDb = mime_db;
  }

  export namespace Exceptions {
    export class HttpException extends BaseHttpException {}
    export class HttpMiddlewareException extends BaseHttpMiddlewareException {}
    export class HttpResponseException extends BaseHttpResponseException {}
    export class NameCollisionException extends BaseNameCollisionException {}
  }

  export namespace CoreLoggers {
    export class ConsoleLogger extends BaseConsoleLogger {}
    export class FileLogger extends BaseFileLogger {}
    export abstract class Logger extends BaseLogger {}
  }

  export namespace Http {
    export type MiddlewareFunction = MiddlewareFunctionDefinition;
    export type MiddlewareType = MiddlewareTypeDefinition;
    export const Middleware = MiddlewareHandler;
    export class Resource extends BaseResource {}
    export class Response extends BaseResponse {}
    export class Server extends BaseServer {}
  }

  export namespace Interfaces {
    export interface LogLevelStructure extends BaseLogLevelStructure {}
    export interface LoggerConfigs extends BaseLoggerConfigs {}
    export interface ParsedRequestBody extends BaseParsedRequestBody {}
    export interface ServerConfigs extends BaseServerConfigs {}
    export interface ResponseOptions extends BaseResponseOptions {}
  }

  export namespace Services {
    export class HttpService extends BaseHttpService {}
    export class HttpRequestService extends BaseHttpRequestService {}
    export class StringService extends BaseStringService {}
  }

  /**
     * A property to hold all loggers added via Drash.addLogger(). This property
     * allows users to access loggers via Drash.Loggers.SomeLogger and acts like
     * a namespace for loggers.
     *
     * @property Drash.Loggers Loggers
     */
  export const Loggers: any = {};
  export type Loggers = {};

  /**
     * A property to hold all members added via Drash.addMember(). This property
     * allows users to access members via Drash.Members.SomeMember and acts like
     * a namespace for members that are external to Drash.
     *
     * @property Drash.Members Members
     */
  export const Members: any = {};
  export type Members = {};

  /**
     * Add a member to the Members namespace. After adding a member, you can use
     * the member via Drash.Members.YourMember.doSomething().
     *
     * @param string name
     *     The member's name which can be accessed via Drash.Members[name].
     * @param any member
     *     The member.
     */
  export function addMember(name: string, member: any) {
    if (Members[name]) {
      throw new Exceptions.NameCollisionException(
        `Members must be unique: "${name}" was already added.`,
      );
    }
    Members[name] = member;
  }

  /**
     * Add a logger to the Loggers namespace. After adding a logger, you can use
     * the logger via Drash.Loggers.YourLogger.doSomething().
     *
     * @param string name
     *     The logger's name which can be accessed via Drash.Members[name].
     * @param any logger
     *     The logger.
     */
  export function addLogger(name: string, logger: any) {
    if (Loggers[name]) {
      throw new Exceptions.NameCollisionException(
        `Loggers must be unique: "${name}" was already added.`,
      );
    }
    Loggers[name] = logger;
  }
}
