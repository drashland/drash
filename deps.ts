const decoder = new TextDecoder();
const encoder = new TextEncoder();
export { decoder, encoder };

import { STATUS_TEXT as StdStatusText } from "https://deno.land/std@0.144.0/http/http_status.ts";
export const STATUS_TEXT = new Map<string, string>(
  Object.entries(StdStatusText),
);

export {
  deleteCookie,
  getCookies,
  setCookie,
} from "https://deno.land/std@0.144.0/http/cookie.ts";

export type { Cookie } from "https://deno.land/std@0.144.0/http/cookie.ts";

export {
  Server as StdServer,
} from "https://deno.land/std@0.144.0/http/server.ts";
export type { ConnInfo } from "https://deno.land/std@0.144.0/http/server.ts";
