import {
  serve,
  ServerRequest
} from "https://deno.land/std@v0.9.0/http/server.ts";

import {
  STATUS_TEXT,
  Status
} from "https://deno.land/std@v0.9.0/http/http_status.ts";

import {
  walkSync
} from "https://deno.land/std@v0.9.0/fs/mod.ts";

export const Decoder = TextDecoder;

export const Encoder = TextEncoder;

export const Http = {
  Request: ServerRequest,
  Status: Status,
  StatusText: STATUS_TEXT,
  serve: serve,
};

export const IO = {
  readFileSync: Deno.readFileSync,
  removeSync: Deno.removeSync,
  walkSync: walkSync,
  writeFileSync: Deno.writeFileSync,
};

export const env = Deno.env;
