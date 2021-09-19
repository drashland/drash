const decoder = new TextDecoder();
const encoder = new TextEncoder();
export { decoder, encoder };

export {
  serve,
  // Response {
  //   status?: number;
  //   headers?: Headers;
  //   body?: Uint8Array | Deno.Reader | string;
  //   trailers?: () => Promise<Headers> | Headers;
  // }
  Server,
  ServerRequest,
  serveTLS,
} from "https://deno.land/std@0.106.0/http/server.ts";

export type {
  HTTPOptions,
  HTTPSOptions,
  Response,
} from "https://deno.land/std@0.106.0/http/server.ts";

export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.106.0/http/http_status.ts";

export { BufReader } from "https://deno.land/std@0.106.0/io/bufio.ts";

export type { ReadLineResult } from "https://deno.land/std@0.106.0/io/bufio.ts";

export { StringReader } from "https://deno.land/std@0.106.0/io/readers.ts";

export {
  MultipartReader,
} from "https://deno.land/std@0.106.0/mime/multipart.ts";

export type {
  FormFile,
  MultipartFormData,
} from "https://deno.land/std@0.106.0/mime/multipart.ts";

export {
  deleteCookie,
  getCookies,
  setCookie,
} from "https://deno.land/std@0.107.0/http/cookie.ts";
export type { Cookie } from "https://deno.land/std@0.107.0/http/cookie.ts";

export { green, red } from "https://deno.land/std@0.106.0/fmt/colors.ts";

export { Moogle } from "https://deno.land/x/moogle@v1.0.0/mod.ts";

export { BumperService } from "https://raw.githubusercontent.com/drashland/services/v0.2.4/ci/bumper_service.ts";

export { ConsoleLogger } from "https://raw.githubusercontent.com/drashland/services/v0.2.4/loggers/console_logger.ts";
