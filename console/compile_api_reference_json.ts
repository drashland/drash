import { Docable } from "https://deno.land/x/docable@v0.0.1/mod.ts";

const d = new Docable(
  [
    "./src/dictionaries/log_levels.ts",
    "./src/dictionaries/mime_db.ts",
    "./src/exceptions/configs_exception.ts",
    "./src/exceptions/http_exception.ts",
    "./src/exceptions/http_middleware_exception.ts",
    "./src/exceptions/http_response_exception.ts",
    "./src/exceptions/invalid_path_exception.ts",
    "./src/exceptions/name_collision_exception.ts",
    "./src/http/request.ts",
    "./src/http/resource.ts",
    "./src/http/response.ts",
    "./src/http/server.ts",
    "./src/interfaces/log_level_structure.ts",
    "./src/interfaces/logger_configs.ts",
    "./src/interfaces/parsed_request_body.ts",
    "./src/interfaces/resource.ts",
    "./src/interfaces/resource_paths.ts",
    "./src/interfaces/response_output.ts",
    "./src/interfaces/server_configs.ts",
    "./src/interfaces/server_middleware.ts",
    "./src/http/request.ts",
    "./src/http/resource.ts",
    "./src/http/response.ts",
    "./src/http/server.ts",
    "./src/services/http_service.ts",
    "./src/services/string_service.ts",
  ],
  "./api_reference.json",
);

const output = d.run();

Deno.writeFileSync("./api_reference.json", new TextEncoder().encode(output));
