Deno.env().DRASH_PROCESS = "test";

// Dictionaries
import "./unit/dictionaries/log_levels_test.ts";

// Exceptions
import "./unit/exceptions/http_exception_test.ts";

// Http
import "./unit/http/middleware_test.ts";
import "./unit/http/resource_test.ts";
import "./unit/http/response_test.ts";
import "./unit/http/server_test.ts";

// Loggers
import "./unit/loggers/console_logger_test.ts";
import "./unit/loggers/file_logger_test.ts";

// Services
import "./unit/services/http_service_test.ts";

// Util
import "./unit/util_test.ts";

// Drash functions
import "./unit/mod_test.ts";

import members from "./members.ts";

members.runTests();
