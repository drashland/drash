import ClassCompiler from "./docs_compiler.ts";

let c = new ClassCompiler();
let result = {
  Exceptions: {
    HttpException: {},
    HttpMiddlewareException: {},
  },
  Http: {
    Middleware: {},
    Resource: {},
    Response: {},
    Server: {},
  },
  Interfaces: {
    LogLevelStructure: {},
    LoggerConfigs: {},
    ParsedRequestBody: {},
    ServerConfigs: {},
    ResponseOptions: {},
  },
  Loggers: {
    ConsoleLogger: {},
    FileLogger: {},
    Logger: {},
    Server: "",
  },
  Services: {
    HttpService: {},
    HttpRequestService: {},
  },
};

c.setPath("./src/exceptions/http_exception.ts");
result.Exceptions.HttpException = await c.compileLazy();

c.setPath("./src/exceptions/http_middleware_exception.ts");
result.Exceptions.HttpMiddlewareException = await c.compileLazy();

c.setPath("./src/http/middleware.ts");
result.Http.Middleware = await c.compileLazy();

c.setPath("./src/http/resource.ts");
result.Http.Resource = await c.compileLazy();

c.setPath("./src/http/response.ts");
result.Http.Response = await c.compileLazy();

c.setPath("./src/http/server.ts");
result.Http.Server = await c.compileLazy();

c.setPath("./src/interfaces/logger_configs.ts");
result.Interfaces.LoggerConfigs = await c.compileLazy();

c.setPath("./src/interfaces/log_level_structure.ts");
result.Interfaces.LogLevelStructure = await c.compileLazy();

c.setPath("./src/interfaces/server_configs.ts");
result.Interfaces.ServerConfigs = await c.compileLazy();

c.setPath("./src/interfaces/parsed_request_body.ts");
result.Interfaces.ParsedRequestBody = await c.compileLazy();

c.setPath("./src/interfaces/response_options.ts");
result.Interfaces.ResponseOptions = await c.compileLazy();

c.setPath("./src/core_loggers/console_logger.ts");
result.Loggers.ConsoleLogger = await c.compileLazy();

c.setPath("./src/core_loggers/file_logger.ts");
result.Loggers.FileLogger = await c.compileLazy();

c.setPath("./src/core_loggers/logger.ts");
result.Loggers.Logger = await c.compileLazy();

c.setPath("./src/services/http_service.ts");
result.Services.HttpService = await c.compileLazy();

c.setPath("./src/services/http_request_service.ts");
result.Services.HttpRequestService = await c.compileLazy();

Deno.writeFileSync(
  "./api_reference.json",
  new TextEncoder().encode(JSON.stringify(result, null, 4)),
);
