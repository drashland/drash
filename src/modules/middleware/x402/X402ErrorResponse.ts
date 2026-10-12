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
 * The `402` (or `400`) response the x402 middleware throws, carrying the
 * `PAYMENT-REQUIRED` header that tells the client how to pay.
 *
 * @module
 */

import type { ResponseStatus } from "../../../core/Types.ts";
import { HTTPError } from "../../../core/errors/HTTPError.ts";

/**
 * The error thrown when a request has not been (validly) paid for.
 *
 * Carries a full response rather than just a message, because the client needs
 * the `PAYMENT-REQUIRED` header to know what to pay.
 */
class X402ErrorResponse extends HTTPError {
  /**
   * The response to send, carrying the x402 headers.
   */
  readonly response: Response;

  /**
   * Create the error with the response that should be sent.
   *
   * @param status The status, normally `Status.PaymentRequired`.
   * @param response The response to send, with the x402 headers set.
   */
  constructor(status: ResponseStatus, response: Response) {
    super(status);
    this.response = response;
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { X402ErrorResponse };
