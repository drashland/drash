// Dictionaries
import "./unit/dictionaries/http_status_codes_test.ts";
import "./unit/dictionaries/log_levels_test.ts";

// Exceptions
import "./unit/exceptions/http_exception_test.ts";

// Http
import "./unit/http/resource_test.ts";
import "./unit/http/response_test.ts";
import "./unit/http/server_test.ts";

// Services
import "./unit/services/http_service.ts";

// Util
import "./unit/util_test.ts";

// Drash functions
import "./unit/mod_test.ts";

import { runTests } from "https://deno.land/x/std/testing/mod.ts";

runTests();
