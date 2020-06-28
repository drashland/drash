import ClassCompiler from "./compiler.ts";

let c = new ClassCompiler();
let result = {
  Exceptions: {
    HttpException: {},
    HttpMiddlewareException: {},
  },
  Http: {
    Middleware: {},
    Request: {},
    Resource: {},
    Response: {},
    Server: {},
  },
  Interfaces: {
    LogLevelStructure: {},
    LoggerConfigs: {},
    ParsedRequestBody: {},
    ServerConfigs: {},
  },
  Loggers: {
    ConsoleLogger: {},
    FileLogger: {},
    Logger: {},
    Server: "",
  },
  Services: {
    HttpService: {},
  },
};

console.info("Building API Reference as JSON output");

c.setPath("./src/exceptions/http_exception.ts");
result.Exceptions.HttpException = await c.compileLazy();

c.setPath("./src/exceptions/http_middleware_exception.ts");
result.Exceptions.HttpMiddlewareException = await c.compileLazy();

c.setPath("./src/http/middleware.ts");
result.Http.Middleware = await c.compileLazy();

c.setPath("./src/http/request.ts");
result.Http.Request = await c.compileLazy();

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

c.setPath("./src/core_loggers/console_logger.ts");
result.Loggers.ConsoleLogger = await c.compileLazy();

c.setPath("./src/core_loggers/file_logger.ts");
result.Loggers.FileLogger = await c.compileLazy();

c.setPath("./src/core_loggers/logger.ts");
result.Loggers.Logger = await c.compileLazy();

c.setPath("./src/services/http_service.ts");
result.Services.HttpService = await c.compileLazy();

console.info("Writing api_reference.json file");

Deno.writeFileSync(
  "./api_reference.json",
  new TextEncoder().encode(JSON.stringify(result, null, 4)),
);

console.info("Done");
