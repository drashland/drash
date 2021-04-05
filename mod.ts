// deno-lint-ignore-file

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
import { ConfigsException as BaseConfigsException } from "./src/exceptions/configs_exception.ts";
import { HttpException as BaseHttpException } from "./src/exceptions/http_exception.ts";
import { InvalidPathException as BaseInvalidPathException } from "./src/exceptions/invalid_path_exception.ts";
import { HttpMiddlewareException as BaseHttpMiddlewareException } from "./src/exceptions/http_middleware_exception.ts";
import { HttpResponseException as BaseHttpResponseException } from "./src/exceptions/http_response_exception.ts";
import { NameCollisionException as BaseNameCollisionException } from "./src/exceptions/name_collision_exception.ts";

// Http
import { Middleware as BaseMiddleware } from "./src/http/middleware.ts";
import { Request as BaseRequest } from "./src/http/request.ts";
import { Resource as BaseResource } from "./src/http/resource.ts";
import { Response as BaseResponse } from "./src/http/response.ts";
import { Server as BaseServer } from "./src/http/server.ts";

// Interfaces
import type { LogLevelStructure as BaseLogLevelStructure } from "./src/interfaces/log_level_structure.ts";
import type { LoggerConfigs as BaseLoggerConfigs } from "./src/interfaces/logger_configs.ts";
import type { ParsedRequestBody as BaseParsedRequestBody } from "./src/interfaces/parsed_request_body.ts";
import type { Resource as BaseHttpResource } from "./src/interfaces/resource.ts";
import type { ResourcePaths as BaseResourcePaths } from "./src/interfaces/resource_paths.ts";
import type { ResponseOutput as BaseResponseOutput } from "./src/interfaces/response_output.ts";
import type { ServerConfigs as BaseServerConfigs } from "./src/interfaces/server_configs.ts";
import type { ServerMiddleware as BaseServerMiddleware } from "./src/interfaces/server_middleware.ts";

// Loggers
import { Logger as BaseLogger } from "./src/core_loggers/logger.ts";
import { ConsoleLogger as BaseConsoleLogger } from "./src/core_loggers/console_logger.ts";
import { FileLogger as BaseFileLogger } from "./src/core_loggers/file_logger.ts";

// Services
import { HttpService as BaseHttpService } from "./src/services/http_service.ts";
import { StringService as BaseStringService } from "./src/services/string_service.ts";

export namespace Drash {
  /**
   * Drash version.
   */
  export const version = "v1.4.4";

  export namespace Dictionaries {
    export const LogLevels = log_levels.LogLevels;
    export const MimeDb = mime_db;
  }

  export namespace Exceptions {
    export class ConfigsException extends BaseConfigsException {}
    export class HttpException extends BaseHttpException {}
    export class HttpMiddlewareException extends BaseHttpMiddlewareException {}
    export class HttpResponseException extends BaseHttpResponseException {}
    export class InvalidPathException extends BaseInvalidPathException {}
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
    export class Request extends BaseRequest {}
    export class Response extends BaseResponse {}
    export class Server extends BaseServer {}
  }

  export namespace Interfaces {
    export interface LogLevelStructure extends BaseLogLevelStructure {}
    export interface LoggerConfigs extends BaseLoggerConfigs {}
    export interface ParsedRequestBody extends BaseParsedRequestBody {}
    export interface Resource extends BaseHttpResource {}
    export interface ResourcePaths extends BaseResourcePaths {}
    export interface ResponseOutput extends BaseResponseOutput {}
    export interface ServerConfigs extends BaseServerConfigs {}
    export interface ServerMiddleware extends BaseServerMiddleware {}
  }

  export namespace Services {
    export class HttpService extends BaseHttpService {}
    export class StringService extends BaseStringService {}
  }

  /**
   * A property to hold all loggers added via Drash.addLogger(). This property
   * allows users to access loggers via Drash.Loggers.SomeLogger and acts like
   * a namespace for loggers.
   */
  export const Loggers: { [key: string]: Drash.CoreLoggers.Logger } = {};
  export type Loggers = {};

  /**
   * A property to hold all members added via Drash.addMember(). This property
   * allows users to access members via Drash.Members.SomeMember and acts like
   * a namespace for members that are external to Drash.
   *
   *     Members.myFunction();
   *     Members.myValue;
   */
  // deno-lint-ignore no-explicit-any
  export const Members: { [key: string]: any } = {}; // This is any because we get errors like "Drash.Members.MyFunction() is not callable"
  export type Members = {};

  /**
   * Add a member to the Members namespace. After adding a member, you can use
   * the member via Drash.Members.YourMember.doSomething() or
   * Drash.Members.YourMember().
   *
   *     addMember("hello");
   *     addMember({ name: Drash });
   *     addMember(class A {})
   *     addMember(function () {})
   *
   * @param name - The member's name which can be accessed via
   * `Drash.Members[name]`.
   * @param member - The member to add. Can be a string, function, boolean, number, class or key value pair.
   */
  // deno-lint-ignore no-explicit-any
  export function addMember(
    name: string,
    member:
      | Function
      | { [key: string]: unknown }
      | string
      | { new (): any }
      | boolean
      | number,
  ) { // Class type is any because any class could be passed in
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
   * @param name - The logger's name which can be accessed via
   * `Drash.Members[name]`.
   * @param logger - The logger.
   */
  export function addLogger(
    name: string,
    logger: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger,
  ) {
    if (Loggers[name]) {
      throw new Exceptions.NameCollisionException(
        `Loggers must be unique: "${name}" was already added.`,
      );
    }
    Loggers[name] = logger;
  }
}
