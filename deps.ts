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
} from "https://deno.land/std@0.71.0/http/server.ts";

export type {
  HTTPOptions,
  HTTPSOptions,
  Response,
} from "https://deno.land/std@0.71.0/http/server.ts";

export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.71.0/http/http_status.ts";

export { BufReader } from "https://deno.land/std@0.71.0/io/bufio.ts";

export type { ReadLineResult } from "https://deno.land/std@0.71.0/io/bufio.ts";

export { StringReader } from "https://deno.land/std@0.71.0/io/readers.ts";

export {
  MultipartReader,
} from "https://deno.land/std@0.71.0/mime/multipart.ts";

export type {
  FormFile,
  MultipartFormData,
} from "https://deno.land/std@0.71.0/mime/multipart.ts";

export {
  deleteCookie,
  getCookies,
  setCookie,
} from "https://deno.land/std@0.71.0/http/cookie.ts";
export type { Cookie } from "https://deno.land/std@0.71.0/http/cookie.ts";

export { green, red } from "https://deno.land/std@0.71.0/fmt/colors.ts";

export { BumperService } from "https://raw.githubusercontent.com/drashland/services/master/ci/bumper_service.ts";
