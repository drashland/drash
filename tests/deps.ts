export const { test } = Deno;

export {
  assert as assertTrue,
  assertEquals,
  assertNotEquals,
  assertThrows,
  assertThrowsAsync,
} from "https://deno.land/std@0.100.0/testing/asserts.ts";

export {
  getCookies,
  setCookie,
} from "https://deno.land/std@0.100.0/http/mod.ts";

export type { Cookie } from "https://deno.land/std@0.100.0/http/mod.ts";

export { render as etaRender } from "https://deno.land/x/eta@v1.6.0/mod.ts";
export { renderToString as ejsRender } from "https://deno.land/x/dejs/mod.ts";
