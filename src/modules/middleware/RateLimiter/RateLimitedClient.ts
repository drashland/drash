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

const defaultOptions: Options = {
  max_requests_allowed_in_time_window: 3, // Client can make 3 requests
  rate_limit_time_window_length: 60000, // 1 minute
};

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
   * @param options See {@link Options}.
   */
  constructor(options: Options = defaultOptions) {
    // TODO(crookse) Ensure options are valid before setting
    this.#options = options;

    this.#rate_limit_window_end_time = this.#getRateLimitEndTimeFromNow();
  }

  get num_requests_made() {
    return this.#num_requests_made;
  }

  get current_request_time() {
    return this.#current_request_time;
  }

  get hit_request_limit() {
    return this.#num_requests_made >
      this.#options.max_requests_allowed_in_time_window;
  }

  get rate_limit_window_end_time() {
    return this.#rate_limit_window_end_time;
  }

  get rate_limit_window_time_elapsed() {
    return this.#current_request_time >= this.#rate_limit_window_end_time;
  }

  get requests_remaining() {
    const remaining = this.#options.max_requests_allowed_in_time_window -
      this.#num_requests_made;
    return remaining <= 0 ? 0 : remaining;
  }

  get max_requests_allowed_in_time_window() {
    return this.#options.max_requests_allowed_in_time_window;
  }

  incrementRequestCount() {
    this.#num_requests_made += 1;

    return this;
  }

  setCurrentRequestTimeToNow() {
    this.#current_request_time = Date.now();

    return this;
  }

  resetTimeWindow() {
    this.#rate_limit_window_end_time = this.#getRateLimitEndTimeFromNow();

    return this;
  }

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
