import "./unit/dictionaries/http_status_codes_test.ts";
import "./unit/exceptions/http_exception_test.ts";
import "./unit/http/resource_test.ts";
import "./unit/http/response_test.ts";
import "./unit/http/server_test.ts";
import "./unit/util_test.ts";

import { runTests } from "https://deno.land/x/std/testing/mod.ts";

runTests();
