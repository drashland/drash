import { Errors, Request, Response, Service } from "../../../mod.ts";
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

export class RateLimiterService extends Service {
  readonly #options: IOptions;

  #memory_store: MemoryStore;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options: IOptions) {
    super();
    this.#options = options;
    this.#memory_store = new MemoryStore(this.#options.timeframe);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public cleanup(): void {
    this.#memory_store.cleanup();
  }

  public runBeforeResource(request: Request, response: Response): void {
    const key = (request.conn_info.remoteAddr as Deno.NetAddr).hostname;
    const { current, reset_time: resetTime } = this.#memory_store.increment(
      key,
    );
    const requestsRemaining = Math.max(this.#options.max_requests - current, 0);

    response.headers.set(
      "X-RateLimit-Limit",
      this.#options.max_requests.toString(),
    );

    response.headers.set(
      "X-RateLimit-Remaining",
      requestsRemaining.toString(),
    );

    response.headers.set("Date", new Date().toUTCString());

    response.headers.set(
      "X-RateLimit-Reset",
      Math.ceil(resetTime.getTime() / 1000).toString(),
    );

    if (this.#options.max_requests && current > this.#options.max_requests) {
      const retryAfter = Math.ceil(this.#options.timeframe / 1000).toString() +
        "s";
      response.headers.set(
        "X-Retry-After",
        retryAfter,
      );
      throw new Errors.HttpError(
        429,
        `Too Many Requests. Please try again after ${retryAfter}.`,
      );
    }
  }
}
