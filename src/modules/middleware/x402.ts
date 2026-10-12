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
 * Middleware that charges for resources using the x402 protocol: it answers
 * `402` with payment requirements until the client sends a payment, has a
 * facilitator verify that payment, and settles it once the resource responds.
 *
 * @see https://github.com/coinbase/x402/blob/main/specs/transports-v2/http.md
 *
 * @module
 */

// Imports > Core
import type { ResponseStatus } from "../../core/Types.ts";
import { HTTPError } from "../../core/errors/HTTPError.ts";
import { Header } from "../../core/http/Header.ts";
import { Status } from "../../core/http/response/Status.ts";

// Imports > Standard
import { Middleware } from "../../standard/http/Middleware.ts";

// Imports > Local
import { decode, encode } from "./x402/Encoding.ts";
import {
  type FacilitatorRequest,
  type PaymentPayload,
  type PaymentRequired,
  type PaymentRequirements,
  type SettleResponse,
  type VerifyResponse,
  X402_VERSION,
} from "./x402/Types.ts";
import { x402ErrorResponse } from "./x402/x402ErrorResponse.ts";

/**
 * The x402 HTTP headers.
 */
const x402Header = {
  /** Server to client: base64 `PaymentRequired`. */
  PaymentRequired: "PAYMENT-REQUIRED",

  /** Client to server: base64 `PaymentPayload`. */
  PaymentSignature: "PAYMENT-SIGNATURE",

  /** Server to client: base64 `SettleResponse`. */
  PaymentResponse: "PAYMENT-RESPONSE",
} as const;

/**
 * The request and the payment it carries, after the facilitator verified it.
 */
export type PreNextContext = {
  request: Request;

  /** The payment the client sent. */
  payment: PaymentPayload;

  /** The entry from `accepts` the payment matched. */
  requirements: PaymentRequirements;
};

/**
 * The verified payment and the response the wrapped resource produced.
 */
export type Context = PreNextContext & {
  response: Response;
};

/**
 * What the middleware charges and which facilitator verifies and settles the
 * payments.
 */
type Options = {
  /**
   * The payment methods the resource accepts. The client pays with one of them.
   */
  accepts: PaymentRequirements[];

  /**
   * Base URL of the facilitator that verifies and settles payments. The
   * middleware POSTs to `{facilitator_url}/verify` and
   * `{facilitator_url}/settle`.
   */
  facilitator_url: string;

  /**
   * Human-readable description of the resource, sent to the client in the
   * `PAYMENT-REQUIRED` header.
   */
  description?: string;

  /**
   * MIME type of the resource's response, sent to the client in the
   * `PAYMENT-REQUIRED` header.
   */
  mime_type?: string;

  /**
   * The `fetch` used to call the facilitator. Defaults to the global `fetch`.
   * Pass your own to add auth headers or to stub the facilitator in tests.
   */
  fetch?: typeof fetch;
};

/**
 * Every option except `accepts` and `facilitator_url` has a default; this is
 * what is merged under the options the middleware is given.
 */
const defaultOptions: Required<Omit<Options, "accepts" | "facilitator_url">> = {
  description: "",
  fetch: (input, init) => fetch(input, init),
  mime_type: "",
};

/**
 * Charges for the resources it wraps using x402.
 *
 * Only requests the wrapped resource answers successfully (status below `400`)
 * are settled, so a client is not charged for an error.
 */
class x402Middleware extends Middleware {
  /**
   * Held as `Required<Options>` because it is the result of merging over
   * `defaultOptions` — every field is present by construction.
   */
  #options: Required<Options>;

  /**
   * Construct the middleware that charges for requests.
   *
   * @param options See {@link Options}.
   */
  constructor(options: Options) {
    super();
    this.#options = {
      ...defaultOptions,
      ...options,
    };
  }

  /**
   * Handle any request by verifying its payment, passing it on, and settling
   * the payment.
   *
   * @param request The request being handled.
   * @returns The resource's response with the `PAYMENT-RESPONSE` header added.
   * @throws {x402ErrorResponse} `402` if the request is unpaid or its payment
   * fails, `400` if the payment is malformed.
   */
  public override ALL(request: Request): Promise<Response> {
    return Promise
      .resolve()
      .then(() => this.readPayment(request))
      .then((context) => this.verify(context))
      .then((context) => this.sendToNext(context))
      .then((context) => this.settle(context));
  }

  /**
   * Read the payment from the `PAYMENT-SIGNATURE` header and find the entry in
   * `accepts` it pays for.
   *
   * @param request The request carrying the payment.
   * @returns The context object (with the `payment` and `requirements` fields
   * set).
   * @throws {x402ErrorResponse} `402` if the header is missing or the payment
   * matches none of `accepts`, `400` if the header cannot be decoded.
   */
  protected readPayment(request: Request): PreNextContext {
    const header = request.headers.get(x402Header.PaymentSignature);

    if (!header) {
      throw this.#error(
        request,
        Status.PaymentRequired,
        `${x402Header.PaymentSignature} header is required`,
      );
    }

    let payment: PaymentPayload;

    try {
      payment = decode<PaymentPayload>(header);
    } catch {
      throw this.#error(
        request,
        Status.BadRequest,
        `${x402Header.PaymentSignature} header is not valid base64 JSON`,
      );
    }

    if (
      !payment ||
      typeof payment !== "object" ||
      !payment.accepted ||
      typeof payment.accepted !== "object" ||
      !payment.payload ||
      typeof payment.payload !== "object"
    ) {
      throw this.#error(
        request,
        Status.BadRequest,
        `${x402Header.PaymentSignature} header is not a valid payment payload`,
      );
    }

    if (payment.x402Version !== X402_VERSION) {
      throw this.#error(
        request,
        Status.PaymentRequired,
        `Unsupported x402Version: ${payment.x402Version}`,
      );
    }

    const requirements = this.#options.accepts.find((accepted) => {
      return accepted.scheme === payment.accepted.scheme &&
        accepted.network === payment.accepted.network &&
        accepted.amount === payment.accepted.amount &&
        accepted.asset === payment.accepted.asset &&
        accepted.payTo === payment.accepted.payTo;
    });

    if (!requirements) {
      throw this.#error(
        request,
        Status.PaymentRequired,
        "Payment does not match any accepted payment requirements",
      );
    }

    return {
      request,
      payment,
      requirements,
    };
  }

  /**
   * Have the facilitator verify the payment.
   *
   * @param context See {@link PreNextContext}.
   * @returns The context, unchanged, if the payment is valid.
   * @throws {x402ErrorResponse} `402` if the facilitator says the payment is
   * invalid.
   */
  protected verify(context: PreNextContext): Promise<PreNextContext> {
    return this
      .#callFacilitator<VerifyResponse>("verify", context)
      .then((result) => {
        if (!result.isValid) {
          throw this.#error(
            context.request,
            Status.PaymentRequired,
            result.invalidReason ?? "Payment is invalid",
          );
        }

        return context;
      });
  }

  /**
   * Send the request to the next handler for a response.
   *
   * @param context See {@link PreNextContext}.
   * @returns The context object (with the `response` field set).
   */
  protected sendToNext(context: PreNextContext): Promise<Context> {
    return Promise
      .resolve()
      .then(() => this.next<Response>(context.request))
      .then((response) => {
        return {
          ...context,
          response,
        };
      });
  }

  /**
   * Have the facilitator settle the payment, then send the response with the
   * settlement in the `PAYMENT-RESPONSE` header.
   *
   * A response with a status of `400` or above is sent as is, unsettled.
   *
   * @param context See {@link Context}.
   * @returns The resource's response.
   * @throws {x402ErrorResponse} `402` if settlement fails.
   */
  protected settle(context: Context): Promise<Response> {
    const { response } = context;

    if (response.status >= 400) {
      return Promise.resolve(response);
    }

    return this
      .#callFacilitator<SettleResponse>("settle", context)
      .then((settlement) => {
        if (!settlement.success) {
          const error = this.#error(
            context.request,
            Status.PaymentRequired,
            settlement.errorReason ?? "Payment settlement failed",
          );

          error.response.headers.set(
            x402Header.PaymentResponse,
            encode(settlement),
          );

          throw error;
        }

        // The resource's response may have immutable headers (e.g., one that
        // came from `fetch()`), so copy it before adding the header
        const headers = new Headers(response.headers);
        headers.set(x402Header.PaymentResponse, encode(settlement));

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      });
  }

  /**
   * POST the payment to one of the facilitator's endpoints.
   *
   * @param endpoint `verify` or `settle`.
   * @param context See {@link PreNextContext}.
   * @returns The facilitator's parsed JSON response.
   * @throws {HTTPError} `500` if the facilitator cannot be reached or does not
   * answer with JSON.
   */
  #callFacilitator<T>(
    endpoint: "verify" | "settle",
    context: PreNextContext,
  ): Promise<T> {
    const body: FacilitatorRequest = {
      x402Version: X402_VERSION,
      paymentPayload: context.payment,
      paymentRequirements: context.requirements,
    };

    const url = `${
      this.#options.facilitator_url.replace(/\/+$/, "")
    }/${endpoint}`;

    return Promise
      .resolve()
      .then(() =>
        this.#options.fetch(url, {
          method: "POST",
          headers: { [Header.ContentType]: "application/json" },
          body: JSON.stringify(body),
        })
      )
      .then((response) => response.json() as Promise<T>)
      .catch(() => {
        throw new HTTPError(
          Status.InternalServerError,
          `The payment facilitator could not ${endpoint} the payment`,
        );
      });
  }

  /**
   * Build the error that tells the client what to pay.
   *
   * @param request The request that was not (validly) paid for.
   * @param status The status to send.
   * @param message Why the request was rejected.
   * @returns The error to throw, carrying the `PAYMENT-REQUIRED` header.
   */
  #error(
    request: Request,
    status: ResponseStatus,
    message: string,
  ): x402ErrorResponse {
    const paymentRequired: PaymentRequired = {
      x402Version: X402_VERSION,
      error: message,
      resource: {
        url: request.url,
        ...(this.#options.description
          ? { description: this.#options.description }
          : {}),
        ...(this.#options.mime_type
          ? { mimeType: this.#options.mime_type }
          : {}),
      },
      accepts: this.#options.accepts,
    };

    const response = new Response(JSON.stringify(paymentRequired), {
      status: status.code,
      statusText: status.description,
      headers: {
        [Header.ContentType]: "application/json",
        [x402Header.PaymentRequired]: encode(paymentRequired),
      },
    });

    return new x402ErrorResponse(status, response);
  }
}

/**
 * Get the middleware class that charges for requests using x402.
 *
 * @param options Options to control the middleware's behavior. See
 * {@link Options} for details.
 *
 * @returns The middleware class that can be instantiated. When it is
 * instantiated, it instantiates with the provided `options`.
 */
function x402(options: Options): new () => x402Middleware {
  return class x402DefaultMiddleware extends x402Middleware {
    constructor() {
      super(options);
    }
  };
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { defaultOptions, type Options, x402, x402Header, x402Middleware };
