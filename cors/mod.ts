import { Drash } from "../deps.ts";
import { vary } from "./deps.ts";

interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}
type ValueOrArray<T> = T | ArrayOfValueOrArray<T>;
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

export const Cors = ({
  origin = "*",
  credentials = false,
  exposeHeaders,
  allowMethods = "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowHeaders,
  maxAge,
  optionsSuccessStatus = 204,
  preflight = true,
}: CorsMiddlewareConfig = {}) =>
  async (
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): Promise<void> => {
    // Make some config properties easier to work with
    if (Array.isArray(exposeHeaders)) {
      exposeHeaders = exposeHeaders.join(",");
    }
    exposeHeaders = (exposeHeaders as string); // To tell the tsc it is 100% a string now
    if (Array.isArray(allowMethods)) {
      allowMethods = allowMethods.join(",");
    }
    allowMethods = (allowMethods as string); // To tell the tsc it is 100% a string now
    if (Array.isArray(allowHeaders)) {
      allowHeaders = allowHeaders.join(",");
    }
    allowHeaders = (allowHeaders as string); // To tell the tsc it is 100% a string now

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
    if (!origin) {
      // allow any origin
      origin = "*";
    } else if (origin !== "*") {
      // reflect origin
      origin = isOriginAllowed(requestOrigin, origin) ? requestOrigin : false;
    }
    origin = (origin as string | boolean); // To tell the tsc it is 100% a string or boolean now

    // If there is no Access-Control-Request-Method header or if parsing failed,
    // do not set any additional headers and terminate this set of steps.
    // The request would be outside the scope of this specification.
    if (
      request.method !== "OPTIONS" ||
      !request.headers.get("Access-Control-Request-Method")
    ) {
      // Simple Cross-Origin Request, Actual Request, and Redirects
      if (origin && typeof origin === "string") {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }

      if (credentials && credentials === true) {
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }

      if (exposeHeaders && typeof exposeHeaders === "string") {
        response.headers.set("Access-Control-Expose-Headers", exposeHeaders);
      }
    } else if (preflight) {
      // Preflight Request
      if (origin && typeof origin === "string") {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }

      if (credentials && credentials === true) {
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }

      if (maxAge) {
        response.headers.set("Access-Control-Max-Age", maxAge.toString());
      }

      if (allowMethods && typeof allowMethods === "string") {
        response.headers.set(
          "Access-Control-Allow-Methods",
          allowMethods,
        );
      }

      if (!allowHeaders) {
        allowHeaders = request.headers.get("Access-Control-Request-Headers") ||
          undefined;
      }

      if (allowHeaders) {
        response.headers.set("Access-Control-Allow-Headers", allowHeaders);
      }

      response.status_code = 204;
    }
  };
