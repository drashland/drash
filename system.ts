// FILE MARKER: DENO STANDARD MODULES //////////////////////////////////////////

export {
  serve,
  ServerRequest
} from "https://deno.land/std@v0.9.0/http/server.ts";

export {
  STATUS_TEXT,
  Status
} from "https://deno.land/std@v0.9.0/http/http_status.ts";

export {
  walkSync
} from "https://deno.land/std@v0.9.0/fs/mod.ts";

// FILE MARKER: DENO LIB ///////////////////////////////////////////////////////

export const env = Deno.env;
export const readFileSync = Deno.readFileSync;
export const removeSync = Deno.removeSync;
export const writeFileSync = Deno.writeFileSync;
