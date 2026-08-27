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
 * One client's request count and time window. The rate limiter keeps one of
 * these per client identifier.
 *
 * @module
 */

type Options = {
  /**
   * TODO(crookse) Description
   */
  max_requests_allowed_in_time_window: number;

  /**
   * TODO(crookse) Description
   */
  rate_limit_time_window_length: number;
};

/**
 * Three requests per minute. Deliberately low — the rate limiter is expected to
 * be configured, and a permissive default would silently do nothing.
 */
const defaultOptions: Options = {
  max_requests_allowed_in_time_window: 3, // Client can make 3 requests
  rate_limit_time_window_length: 60000, // 1 minute
};

/**
 * One client's request count and its current time window.
 *
 * The rate limiter keeps one of these per client identifier. The window is not
 * reset on a timer; it is checked and reset lazily when the client is next seen.
 */
class RateLimitedClient {
  #num_requests_made = 0; // Client's request count starts at 0

  /**
   * Used to calculate the client's current request's time against the client's
   * rate limit window to see if rate limiting should occur.
   *
   * Initially set to -1 to denote a "note set" value.
   */
  #current_request_time = -1;

  /**
   * @see {@link Options}
   */
  #options: Options;

  #rate_limit_window_end_time: number;

  /**
   * Start a client with a fresh window and no requests recorded.
   *
   * @param options See {@link Options}.
   */
  constructor(options: Options = defaultOptions) {
    // TODO(crookse) Ensure options are valid before setting
    this.#options = options;

    this.#rate_limit_window_end_time = this.#getRateLimitEndTimeFromNow();
  }

  /**
   * How many requests this client has made in the current window.
   */
  get num_requests_made(): number {
    return this.#num_requests_made;
  }

  /**
   * When the request being processed arrived, as a Unix timestamp in
   * milliseconds. `-1` until the first request is recorded.
   */
  get current_request_time(): number {
    return this.#current_request_time;
  }

  /**
   * Whether this client has gone past its limit for the current window.
   */
  get hit_request_limit(): boolean {
    return this.#num_requests_made >
      this.#options.max_requests_allowed_in_time_window;
  }

  /**
   * When the current window closes, as a Unix timestamp in milliseconds. This is
   * what the `X-RateLimit-Reset` header reports.
   */
  get rate_limit_window_end_time(): number {
    return this.#rate_limit_window_end_time;
  }

  /**
   * Whether the current window has closed, which means the count should be reset
   * before this request is counted.
   */
  get rate_limit_window_time_elapsed(): boolean {
    return this.#current_request_time >= this.#rate_limit_window_end_time;
  }

  /**
   * How many requests this client has left in the current window. Never negative
   * — a client over its limit reads `0`.
   */
  get requests_remaining(): number {
    const remaining = this.#options.max_requests_allowed_in_time_window -
      this.#num_requests_made;
    return remaining <= 0 ? 0 : remaining;
  }

  /**
   * The configured request limit, which is what the `X-RateLimit-Limit` header
   * reports.
   */
  get max_requests_allowed_in_time_window(): number {
    return this.#options.max_requests_allowed_in_time_window;
  }

  /**
   * Count the request being processed.
   *
   * @returns This client, for chaining.
   */
  incrementRequestCount(): this {
    this.#num_requests_made += 1;

    return this;
  }

  /**
   * Record that the request being processed arrived now.
   *
   * @returns This client, for chaining.
   */
  setCurrentRequestTimeToNow(): this {
    this.#current_request_time = Date.now();

    return this;
  }

  /**
   * Open a new window, ending one window length from now.
   *
   * @returns This client, for chaining.
   */
  resetTimeWindow(): this {
    this.#rate_limit_window_end_time = this.#getRateLimitEndTimeFromNow();

    return this;
  }

  /**
   * Set the request count back to zero, which is done when a new window opens.
   *
   * @returns This client, for chaining.
   */
  resetRequestCount(): this {
    this.#num_requests_made = 0;

    return this;
  }

  #getRateLimitEndTimeFromNow() {
    return Date.now() + this.#options.rate_limit_time_window_length;
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { RateLimitedClient };
