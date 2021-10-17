import { IService, Request, Response, Service } from "../../../mod.ts";
import { vary } from "./deps.ts";

type ValueOrArray<T> = T | Array<ValueOrArray<T>>;
type OriginOption = ValueOrArray<string | boolean | RegExp>;

type CorsMiddlewareConfig = {
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

export class CorsService extends Service implements IService {
  #config: CorsMiddlewareConfig;

  constructor({
    origin = "*",
    credentials = false,
    exposeHeaders,
    allowMethods = "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowHeaders,
    maxAge,
    preflight = true,
  }: CorsMiddlewareConfig = {}) {
    super();
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
      (header: string) => response.headers.get(header) || "",
      (header: string, value: string) => {
        response.headers.set(header, value);
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
        response.headers.set(
          "Access-Control-Allow-Origin",
          this.#config.origin,
        );
      }

      if (this.#config.credentials && this.#config.credentials === true) {
        response.headers.set(
          "Access-Control-Allow-Credentials",
          "true",
        );
      }

      if (
        this.#config.exposeHeaders &&
        typeof this.#config.exposeHeaders === "string"
      ) {
        response.headers.set(
          "Access-Control-Expose-Headers",
          this.#config.exposeHeaders,
        );
      }
    } else if (this.#config.preflight) {
      // Preflight Request
      if (this.#config.origin && typeof this.#config.origin === "string") {
        response.headers.set(
          "Access-Control-Allow-Origin",
          this.#config.origin,
        );
      }

      if (this.#config.credentials && this.#config.credentials === true) {
        response.headers.set(
          "Access-Control-Allow-Credentials",
          "true",
        );
      }

      if (this.#config.maxAge) {
        response.headers.set(
          "Access-Control-Max-Age",
          this.#config.maxAge.toString(),
        );
      }

      if (
        this.#config.allowMethods &&
        typeof this.#config.allowMethods === "string"
      ) {
        response.headers.set(
          "Access-Control-Allow-Methods",
          this.#config.allowMethods,
        );
      }

      if (!this.#config.allowHeaders) {
        this.#config.allowHeaders =
          request.headers.get("Access-Control-Request-Headers") ||
          undefined;
      }

      if (this.#config.allowHeaders) {
        response.headers.set(
          "Access-Control-Allow-Headers",
          this.#config.allowHeaders,
        );
      }

      response.status = 204;
    }
  }
}
