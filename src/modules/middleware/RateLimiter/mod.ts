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

// Imports > Core
import { HTTPError } from "../../../core/errors/HTTPError.ts";
import { Header } from "../../../core/http/Header.ts";
import { Status } from "../../../core/http/response/Status.ts";
import { StatusCode } from "../../../core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../core/http/response/StatusDescription.ts";

// Imports > Standard
import { Middleware } from "../../../standard/http/Middleware.ts";
import { response } from "./RateLimitResponse.ts";

// Imports > Modules
import { RateLimitedClient } from "./RateLimitedClient.ts";

// Imports > Local
import { RateLimiterErrorResponse } from "./RateLimiterErrorResponse.ts";

type PreNextContext = {
  /**
   * The current client being processed.
   *
   * If `null`, an attempt was tried to identify the client, but no identifer
   * (e.g., the `client_id_header_name` option) was provided to help identify
   * and track the client.
   */
  client: RateLimitedClient | null;

  request: Request;
};

type Context = PreNextContext & {
  response: Response;
};

type Options = {
  /**
   * How much time (in milliseconds) a client is allocated the `max_requests`.
   */
  rate_limit_time_window_length: number;

  /**
   * Number of requests a client is allowed within the `rate_limit_window`.
   */
  max_requests: number;

  /**
   * The header containing the connection information (e.g., a client's address)
   * that is subject to rate limiting.
   */
  client_id_header_name: string;

  /**
   * Should the middleware throw an HTTP 400 error if the connection information
   * header is missing?
   */
  throw_if_connection_header_name_missing: boolean;
};

const defaultOptions: Options = {
  client_id_header_name: "x-drash-ratelimit-client-id",
  max_requests: 3,
  rate_limit_time_window_length: 60000, // 1 minute
  throw_if_connection_header_name_missing: true,
};

class RateLimiterMiddleware extends Middleware {
  #options: Options;
  #request_store: Record<string, RateLimitedClient> = {};

  /**
   * Construct the middleware that handles rate limiting requests.
   *
   * @param options See {@link Options}.
   */
  constructor(options: Options = defaultOptions) {
    super();
    this.#options = options;
  }

  public ALL(request: Request): Promise<Response> {
    return Promise
      .resolve()
      .then(() => this.setClientInContext(request))
      .then((context) => this.throwIfRateLimited(context))
      .then((context) => this.sendToNext(context))
      .then((context) => this.sendResponse(context));
  }

  /**
   * Send the response in the context object to the caller.
   *
   * @param context See {@link Context}.
   *
   * @returns The response in the context object.
   *
   * @throws An {@link HTTPError} with a 500 status code if no response is set
   * in the context object.
   */
  protected sendResponse(context: Context) {
    const client = context.client;

    // No client, just send the repsonse that was set in the context object
    if (!client) {
      return context.response;
    }

    if (!context.response) {
      throw new HTTPError(
        Status.InternalServerError,
        `The server failed to generate a response`,
      );
    }

    const ret = this
      .#getDecoratedResponse(context.response, client)
      .build();

    return ret;
  }

  /**
   * Send the request to the next handler for a response.
   *
   * @param context See {@link PreNextContext}.
   *
   * @returns The context object (with the `response` field set) to be handled
   * by any further handlers.
   */
  protected sendToNext(context: PreNextContext) {
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
   * Set the client in the context object.
   *
   * @param request The request containing the header that holds the unique
   * identifier of the client. The header should be the value that was provided
   * in `options.client_id_header_name`.
   *
   * @returns The context object (with the `request` and `client` fields set).
   *
   * @throws An {@link HTTPError} if the `option.client_id_header_name` value
   * is falsy and `option.throw_if_connection_header_name_missing` is `true`.
   */
  protected setClientInContext(request: Request) {
    const clientId = request.headers.get(this.#options.client_id_header_name);

    if (!clientId) {
      // The value of `client` is `null` to let further processes know this
      // method tried to identify the client, but could not due to the missing
      // header.
      const context = {
        client: null,
        request,
      };

      if (this.#options.throw_if_connection_header_name_missing) {
        throw new HTTPError(
          Status.BadRequest,
          `Request header '${this.#options.client_id_header_name}' is required`,
        );
      }

      return context;
    }

    let client = this.#request_store[clientId];

    // No client yet? This must be a new client, so start tracking it.
    if (!client) {
      this.#request_store[clientId] = new RateLimitedClient({
        max_requests_allowed_in_time_window: this.#options.max_requests,
        rate_limit_time_window_length:
          this.#options.rate_limit_time_window_length,
      });

      client = this.#request_store[clientId];
    }

    // We consider the client making a request when it gets to this point in
    // this middleware
    client.incrementRequestCount();

    // Track this client's request time as of right now so that rate limit times
    // can be calculated against this time
    client.setCurrentRequestTimeToNow();

    return {
      client,
      request,
    };
  }

  /**
   * Check the client to see if it should be rate limited.
   *
   * @param context See {@link PreNextContext}.
   *
   * @returns The context to be handled by any further handlers.
   *
   * @throws An {@link RateLimiterErrorResponse} if the client is rate limited.
   */
  protected throwIfRateLimited(context: PreNextContext) {
    // No rate limit? Move along... clients are allowed to make as many requests
    // as they want.
    if (!this.#options.max_requests) {
      return context;
    }

    const client = context.client;

    // No client was identified? Guess the rate limit is a no go.
    if (client === null) {
      return context;
    }

    // If the client is making this request past their rate limit window time,
    // then their request should be allowed through. Also, their counters should
    // be reset so their subsequent requests in this current rate limit window
    // are handled properly.
    if (client.rate_limit_window_time_elapsed) {
      client
        .resetRequestCount()
        .resetTimeWindow();

      return context;
    }

    // If the client has not exceeded their max number of requests, then allow
    // the client through. Since we already checked if the client was past their
    // rate limit window above and reset their counters, we do not reset
    // anything here. Otherwise, the client could end up making more requests
    // than allowed.
    if (!client.hit_request_limit) {
      return context;
    }

    // If we get here, that means the client hit their request limit and their
    // rate limit window has not elapsed. In other words, the have made too
    // many requests at this point, so we build and throw the error below.

    // Create a basic response ...
    const body =
      `Too many requests. Next request can be made after the time set in the Retry-After header.`;
    const basicResponse = new Response(body);

    // ... and decorate it
    const errorResponse = this
      .#getDecoratedResponse(basicResponse, client)
      .status(StatusCode.TooManyRequests)
      .statusText(StatusDescription.TooManyRequests)
      .build();

    // Chains are expected to be set up to catch this error and handle it
    // accordingly -- either using the `errorResponse` as it is built abve or
    // doing something else that meets their requirements.
    //
    // We do not return `new Response("Too many requests", { status: 429 })`
    // because that can:
    //
    // - cause the chain to receive it in a `.then()` block; or
    // - cause the chain (depending on how it is set up) to be filtered by other
    //   processes (e.g., other middleware).
    //
    // The above process could result in the `errorResponse` built here to be
    // modified unexpectedly (e.g., by other middleware). To prevent this side
    // effect, we throw an error to "terminate this request early and now" and
    // let it be handled by error handling processes only.
    throw new RateLimiterErrorResponse(
      Status.TooManyRequests,
      errorResponse,
    );
  }

  #getDecoratedResponse(decoratee: Response, client: RateLimitedClient) {
    const retryAfter = client.rate_limit_window_end_time;

    return response(decoratee)
      .addRateLimitHeaders({
        limit: client.max_requests_allowed_in_time_window,
        remaining: client.requests_remaining,
        reset: client.rate_limit_window_end_time,
        retry_after: new Date(retryAfter),
      })
      .headers({
        [Header.Date]: (new Date()).toUTCString(),
      });
  }
}

/**
 * Get the middleware class that handles rate limiting requests.
 *
 * @param options (Optional) Options to control the middleware's behavior. See
 * {@link Options} for details.
 *
 * @returns The middleware class that can be instantiated. When it is
 * instantiated, it instantiates with the provided `options`. If no options are
 * provided, it uses its default options.
 */
function RateLimiter(options: Options) {
  return class DefaultRateLimiterMiddleware extends RateLimiterMiddleware {
    constructor() {
      super(options);
    }
  };
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Options, RateLimiter, RateLimiterMiddleware };
