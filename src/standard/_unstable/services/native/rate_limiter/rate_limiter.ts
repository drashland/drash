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

import { Errors, Interfaces, Request } from "../../../mod.deno.ts";
import { Promisable } from "../../../src/core/types.ts";
import { MemoryStore } from "./memory_store.ts";

interface IOptions {
  /**
   * How long (in milliseconds) an IP is allocated the `max_requests`.
   */
  timeframe: number;

  /**
   * Number of requests an IP is allowed within the `timeframe`.
   */
  // deno-lint-ignore camelcase
  max_requests: number;
}

export class RateLimiterService implements Interfaces.Service {
  readonly #options: IOptions;

  #memory_store: MemoryStore;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options: IOptions) {
    this.#options = options;
    this.#memory_store = new MemoryStore(this.#options.timeframe);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public cleanup(): void {
    this.#memory_store.cleanup();
  }

  public runBeforeResource(request: Request): void {
    const connectionInfo = request.headers.get("x-drash-connection-info");

    if (!connectionInfo) {
      return;
    }

    const remoteAddressJson = JSON.parse(connectionInfo);
    const key = (remoteAddressJson.remoteAddr as Deno.NetAddr).hostname;
    const { current, reset_time: resetTime } = this.#memory_store.increment(
      key,
    );
    const requestsRemaining = Math.max(this.#options.max_requests - current, 0);

    response.headers({
      "X-RateLimit-Limit": this.#options.max_requests.toString(),
    });

    response.headers({
      "X-RateLimit-Remaining": requestsRemaining.toString(),
    });

    response.headers({
      "Date": new Date().toUTCString(),
    });

    response.headers({
      "X-RateLimit-Reset": Math.ceil(resetTime.getTime() / 1000).toString(),
    });

    if (this.#options.max_requests && current > this.#options.max_requests) {
      const retryAfter = Math.ceil(this.#options.timeframe / 1000).toString() +
        "s";
      response.headers({
        "X-Retry-After": retryAfter,
      });
      throw new HTTPError(
        429,
        `Too Many Requests. Please try again after ${retryAfter}.`,
      );
    }
  }

  public runOnError(
    request: Interfaces.NativeRequest,
  ): Promisable<void | Response> {
  }
}
