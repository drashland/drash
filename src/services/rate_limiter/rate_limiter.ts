import { Errors, IService, Request, Response, Service } from "../../../mod.ts";

/**
 * This allows us to pass the TS compiler, so we can add properties to a method that uses it. See `csrf` method below
 */
interface F {
  (): void;
  token: string;
}

interface Options {
  /* How long (in milliseconds) an IP is allocated the `maxRequest`s */
  timeframe: number;
  /* Number of requests an IP is allowed within the `timeframe` */
  maxRequests: number;
}

class MemoryStore {
  private hits: Record<string, number> = {};
  private resetTime: Date;
  private timeframe: number;
  private intervalId: number | null = null;

  /**
   * @param timeframe - Reset time/duration
   */
  constructor(timeframe: number) {
    this.resetTime = this.calculateNextResetTime(timeframe);
    this.timeframe = timeframe;
    this.queueReset();
  }

  /**
   * Create the next reset time given the `timeframe`
   *
   * @param timeframe Essentially, current time + timeframe
   *
   * @returns The new reset time
   */
  private calculateNextResetTime(timeframe: number): Date {
    const d = new Date();
    d.setMilliseconds(d.getMilliseconds() + timeframe);
    return d;
  }

  /**
   * Increase the number of hits given the ip
   *
   * @param key - The IP of the request
   *
   * @returns The current amount of requests recieved for `key` (`hits`) and
   * the reset time
   */
  public increment(key: string): {
    current: number;
    resetTime: Date;
  } {
    if (this.hits[key]) {
      this.hits[key]++;
    } else {
      this.hits[key] = 1;
    }
    return {
      current: this.hits[key],
      resetTime: this.resetTime,
    };
  }

  /**
   * Start an interval to reset the hits and reset time based on the timeframr
   */
  private queueReset() {
    this.intervalId = setInterval(() => {
      this.hits = {};
      this.resetTime = this.calculateNextResetTime(this.timeframe);
    }, this.timeframe);
  }

  /**
   * Mainly used in tests, to cleanup ops
   */
  public cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export class RateLimiterService extends Service implements IService {
  readonly #options: Options;

  #memoryStore: MemoryStore;

  constructor(options: Options) {
    super();
    this.#options = options;
    this.#memoryStore = new MemoryStore(this.#options.timeframe);
  }

  public cleanup() {
    this.#memoryStore.cleanup();
  }

  runBeforeResource(request: Request, response: Response) {
    const key = (request.conn_info.remoteAddr as Deno.NetAddr).hostname;
    const { current, resetTime } = this.#memoryStore.increment(key);
    const requestsRemaining = Math.max(this.#options.maxRequests - current, 0);

    response.headers.set(
      "X-RateLimit-Limit",
      this.#options.maxRequests.toString(),
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

    if (this.#options.maxRequests && current > this.#options.maxRequests) {
      response.headers.set(
        "X-Retry-After",
        Math.ceil(this.#options.timeframe / 1000).toString() + "s",
      );
      throw new Errors.HttpError(
        429,
        "Too many requests, please try again later.",
      );
    }
  }
}
