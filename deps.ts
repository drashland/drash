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
} from "https://deno.land/std@0.88.0/http/server.ts";

export type {
  HTTPOptions,
  HTTPSOptions,
  Response,
} from "https://deno.land/std@0.88.0/http/server.ts";

export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.88.0/http/http_status.ts";

export { BufReader } from "https://deno.land/std@0.88.0/io/bufio.ts";

export type { ReadLineResult } from "https://deno.land/std@0.88.0/io/bufio.ts";

export { StringReader } from "https://deno.land/std@0.88.0/io/readers.ts";

export {
  MultipartReader,
} from "https://deno.land/std@0.88.0/mime/multipart.ts";

export type {
  FormFile,
  MultipartFormData,
} from "https://deno.land/std@0.88.0/mime/multipart.ts";

export {
  deleteCookie,
  getCookies,
  setCookie,
} from "https://deno.land/std@0.88.0/http/cookie.ts";
export type { Cookie } from "https://deno.land/std@0.88.0/http/cookie.ts";

export { green, red } from "https://deno.land/std@0.88.0/fmt/colors.ts";

export {
  IndexService,
} from "https://raw.githubusercontent.com/drashland/services/v0.1.0/index/index_service.ts";
export type {
  ISearchResult,
} from "https://raw.githubusercontent.com/drashland/services/v0.1.0/index/index_service.ts";
// export {
//   IndexService,
//   ISearchResult,
// } from "../services/index/index_service.ts";

export { BumperService } from "https://raw.githubusercontent.com/drashland/services/v0.1.0/ci/bumper_service.ts";

export { ConsoleLogger } from "https://raw.githubusercontent.com/drashland/services/v0.1.0/loggers/console_logger.ts";
