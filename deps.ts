const decoder = new TextDecoder();
const encoder = new TextEncoder();
export { decoder, encoder };

export { STATUS_TEXT } from "https://deno.land/std@0.134.0/http/http_status.ts";

export {
  deleteCookie,
  getCookies,
  setCookie,
} from "https://deno.land/std@0.134.0/http/cookie.ts";

export type { Cookie } from "https://deno.land/std@0.134.0/http/cookie.ts";

export { deferred } from "https://deno.land/std@0.134.0/async/deferred.ts";

export {
  Server as StdServer,
} from "https://deno.land/std@0.134.0/http/server.ts";
export type { ConnInfo } from "https://deno.land/std@0.134.0/http/server.ts";
