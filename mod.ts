// Version bumps:
// console/install.deno
// README.md
// REQUIREMENTS.md

// Dictionaries
import * as log_levels from "./src/dictionaries/log_levels.ts";

// Exceptions
import http_exception from "./src/exceptions/http_exception.ts";
import http_middleware_exception from "./src/exceptions/http_middleware_exception.ts";
import http_response_exception from "./src/exceptions/http_response_exception.ts";
import name_collision_exception from "./src/exceptions/name_collision_exception.ts";

// Http
import middleware from "./src/http/middleware.ts";
import resource from "./src/http/resource.ts";
import response from "./src/http/response.ts";
import server from "./src/http/server.ts";

// Interfaces
import * as interface_logger_configs from "./src/interfaces/logger_configs.ts";
import * as interface_log_level_structure from "./src/interfaces/log_level_structure.ts";

// Loggers
import base_logger from "./src/core_loggers/logger.ts";
import console_logger from "./src/core_loggers/console_logger.ts";
import file_logger from "./src/core_loggers/file_logger.ts";

// Services
import http_service from "./src/services/http_service.ts";
import http_request_service from "./src/services/http_request_service.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER: NAMESPACE - DRASH //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//
// Usage: import Drash from "/path/to/drash/mod.ts";
//

namespace Drash {
  export namespace Dictionaries {
    export const LogLevels = log_levels.LogLevels;
    // export namespace Enums {
    //   export const LogLevel = log_levels.LogLevel;
    // }
  }

  export namespace Exceptions {
    export type HttpException = http_exception;
    export const HttpException = http_exception;
    export type HttpMiddlewareException = http_middleware_exception;
    export const HttpMiddlewareException = http_middleware_exception;
    export type HttpResponseException = http_response_exception;
    export const HttpResponseException = http_response_exception;
    export type NameCollisionException = name_collision_exception;
    export const NameCollisionException = name_collision_exception;
  }

  export namespace CoreLoggers {
    export type ConsoleLogger = console_logger;
    export const ConsoleLogger = console_logger;
    export type FileLogger = file_logger;
    export const FileLogger = file_logger;
    export type Logger = base_logger;
    export const Logger = base_logger;
  };

  export namespace Http {
    export type Middleware = middleware;
    export let Middleware = middleware;
    export type Resource = resource;
    export const Resource = resource;
    export type Response = response;
    export let Response = response;
    export type Server = server;
    export const Server = server;
  }

  export namespace Interfaces {
    export const LoggerConfigs = interface_logger_configs;
    export const LogLevelStructure = interface_log_level_structure;
  }

  export namespace Services {
    export type HttpService = http_service;
    export const HttpService = new http_service();
    export type HttpRequestService = http_request_service;
    export const HttpRequestService = new http_request_service();
  }

  /**
   * A property to hold all loggers added via Drash.addLogger(). This property
   * allows users to access loggers via Drash.Loggers.SomeLogger and acts like
   * a namespace for loggers.
   *
   * @property Drash.Loggers Loggers
   */
  export const Loggers: any = {};

  /**
   * A property to hold all members added via Drash.addMember(). This property
   * allows users to access members via Drash.Members.SomeMember and acts like
   * a namespace for members that are external to Drash.
   *
   * @property Drash.Members Members
   */
  export const Members: any = {};

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
    if (this.Members[name]) {
      throw new this.Exceptions.NameCollisionException(
        `Members must be unique: "${name}" was already added.`
      );
    }
    this.Members[name] = member;
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
    if (this.Loggers[name]) {
      throw new this.Exceptions.NameCollisionException(
        `Loggers must be unique: "${name}" was already added.`
      );
    }
    this.Loggers[name] = logger;
  }
}

export default Drash;
