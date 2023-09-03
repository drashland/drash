/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
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

import { Interfaces, Request, Response } from "../../../mod.deno.ts";
import { vary } from "./deps.ts";

type ValueOrArray<T> = T | Array<ValueOrArray<T>>;
type OriginOption = ValueOrArray<string | boolean | RegExp>;

type CORSMiddlewareConfig = {
  origin?: OriginOption;
  credentials?: boolean;
  exposeHeaders?: string | string[];
  allowMethods?: string | string[];
  allowHeaders?: string | string[];
  maxAge?: number;
  optionsSuccessStatus?: number;
  preflight?: boolean;
};

/**
 * Is the origin allowed for the request?
 *
 * @param reqOrigin - The header value from the request
 * @param origin - The origin option for the config
 *
 * @returns Whether or not the origin option is allowed for the origin header
 */
const isOriginAllowed = (reqOrigin: string, origin: OriginOption): boolean => {
  if (Array.isArray(origin)) {
    for (let i = 0; i < origin.length; ++i) {
      if (isOriginAllowed(reqOrigin, origin[i])) {
        return true;
      }
    }
    return false;
  } else if (typeof origin === "string") {
    return reqOrigin === origin;
  } else if (origin instanceof RegExp) {
    return origin.test(reqOrigin);
  } else {
    return !!origin;
  }
};

export class CORSService implements Interfaces.Service {
  #config: CORSMiddlewareConfig;

  constructor({
    origin = "*",
    credentials = false,
    exposeHeaders,
    allowMethods = "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowHeaders,
    maxAge,
    preflight = true,
  }: CORSMiddlewareConfig = {}) {
    this.#config = {
      origin,
      credentials,
      exposeHeaders,
      allowHeaders,
      allowMethods,
      maxAge,
      preflight,
    };
  }

  runAfterResource(request: Request, response: Response) {
    if (Array.isArray(this.#config.exposeHeaders)) {
      this.#config.exposeHeaders = this.#config.exposeHeaders.join(",");
    }
    this.#config.exposeHeaders = this.#config.exposeHeaders as string; // To tell the tsc it is 100% a string now
    if (Array.isArray(this.#config.allowMethods)) {
      this.#config.allowMethods = this.#config.allowMethods.join(",");
    }
    this.#config.allowMethods = this.#config.allowMethods as string; // To tell the tsc it is 100% a string now
    if (Array.isArray(this.#config.allowHeaders)) {
      this.#config.allowHeaders = this.#config.allowHeaders.join(",");
    }
    this.#config.allowHeaders = this.#config.allowHeaders as string; // To tell the tsc it is 100% a string now

    // Always set Vary header
    // https://github.com/rs/cors/issues/10
    vary(
      (header: string) => response.headers_init?.get(header) || "",
      (header: string, value: string) => {
        response.headers({ [header]: value });
      },
      "origin",
    );

    // If the Origin header is not present terminate this set of steps.
    // The request would be outside the scope of this specification.
    const requestOrigin = request.headers.get("Origin");
    if (!requestOrigin) {
      return;
    }
    if (!this.#config.origin) {
      // allow any origin
      this.#config.origin = "*";
    } else if (this.#config.origin !== "*") {
      // reflect origin
      this.#config.origin = isOriginAllowed(requestOrigin, this.#config.origin)
        ? requestOrigin
        : false;
    }
    this.#config.origin = this.#config.origin as string | boolean; // To tell the tsc it is 100% a string or boolean now

    // If there is no Access-Control-Request-Method header or if parsing failed,
    // do not set any additional headers and terminate this set of steps.
    // The request would be outside the scope of this specification.
    if (
      request.method !== "OPTIONS" ||
      !request.headers.get("Access-Control-Request-Method")
    ) {
      // Simple Cross-Origin Request, Actual Request, and Redirects
      if (this.#config.origin && typeof this.#config.origin === "string") {
        response.headers({
          "Access-Control-Allow-Origin": this.#config.origin,
        });
      }

      if (this.#config.credentials && this.#config.credentials === true) {
        response.headers({
          "Access-Control-Allow-Credentials": "true",
        });
      }

      if (
        this.#config.exposeHeaders &&
        typeof this.#config.exposeHeaders === "string"
      ) {
        response.headers({
          "Access-Control-Expose-Headers": this.#config.exposeHeaders,
        });
      }
    } else if (this.#config.preflight) {
      // Preflight Request
      if (this.#config.origin && typeof this.#config.origin === "string") {
        response.headers({
          "Access-Control-Allow-Origin": this.#config.origin,
        });
      }

      if (this.#config.credentials && this.#config.credentials === true) {
        response.headers({
          "Access-Control-Allow-Credentials": "true",
        });
      }

      if (this.#config.maxAge) {
        response.headers({
          "Access-Control-Max-Age": this.#config.maxAge.toString(),
        });
      }

      if (
        this.#config.allowMethods &&
        typeof this.#config.allowMethods === "string"
      ) {
        response.headers({
          "Access-Control-Allow-Methods": this.#config.allowMethods,
        });
      }

      if (!this.#config.allowHeaders) {
        this.#config.allowHeaders =
          request.headers.get("Access-Control-Request-Headers") ||
          undefined;
      }

      if (this.#config.allowHeaders) {
        response.headers({
          "Access-Control-Allow-Headers": this.#config.allowHeaders,
        });
      }

      response.status(204);
    }
  }
}
