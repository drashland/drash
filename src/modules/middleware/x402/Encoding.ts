/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Base64-encoded JSON, the format every x402 header value uses.
 *
 * Built on `btoa`/`atob` and `TextEncoder`/`TextDecoder` rather than Node's
 * `Buffer` so it runs unchanged on Deno, Node, Bun, and Cloudflare Workers.
 *
 * @module
 */

/**
 * Encode a value as base64 JSON.
 *
 * @param value Any JSON-serializable value.
 * @returns The value's JSON, UTF-8 encoded, then base64 encoded.
 */
function encode(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

/**
 * Decode a base64 JSON value.
 *
 * @param value A base64 string holding UTF-8 encoded JSON.
 * @returns The parsed JSON value.
 * @throws {Error} If `value` is not valid base64 or does not hold valid JSON.
 */
function decode<T>(value: string): T {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { decode, encode };
