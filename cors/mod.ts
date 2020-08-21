import { Drash } from "../deps.ts";
import { vary } from "./deps.ts";

interface ArrayOfValueOrArray<T> extends Array<ValueOrArray<T>> {}
type ValueOrArray<T> = T | ArrayOfValueOrArray<T>;
type OriginOption =
  | ((
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ) => string | Promise<string>)
  | ValueOrArray<string | boolean | RegExp>;

type CorsMiddlewareConfig = {
  origin?: OriginOption;
  credentials?:
    | ((
      request: Drash.Http.Request,
      response?: Drash.Http.Response,
    ) => boolean | Promise<boolean>)
    | boolean;
  exposeHeaders?: string | string[];
  allowMethods?: string | string[];
  allowHeaders?: string | string[];
  maxAge?: number;
  optionsSuccessStatus?: number;
  preflight?: boolean;
};

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

export const CorsMiddleware = ({
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
    let options: any = {
      origin,
      credentials,
      optionsSuccessStatus,
      preflight,
    };

    if (!options.origin) {
      return;
    }

    if (Array.isArray(exposeHeaders)) {
      options.exposeHeaders = exposeHeaders.join(",");
    } else {
      options.exposeHeaders = exposeHeaders;
    }

    if (Array.isArray(allowMethods)) {
      options.allowMethods = allowMethods.join(",");
    } else {
      options.allowMethods = allowMethods;
    }

    if (Array.isArray(allowHeaders)) {
      options.allowHeaders = allowHeaders.join(",");
    } else {
      options.allowHeaders = allowHeaders;
    }

    if (maxAge) {
      options.maxAge = String(maxAge);
    }

    // If the Origin header is not present terminate this set of steps.
    // The request is outside the scope of this specification.
    const requestOrigin = request.headers.get("Origin");

    // Always set Vary header
    // https://github.com/rs/cors/issues/10
    vary(
      (header: string) => response.headers.get(header) || "",
      (header: string, value: string) => {
        response.headers.set(header, value);
      },
      "origin",
    );

    if (!requestOrigin) {
      return;
    }

    let o;

    if (!options.origin || options.origin === "*") {
      // allow any origin
      o = "*";
    } else if (typeof options.origin === "string") {
      // fixed origin
      o = options.origin;
    } else if (typeof options.origin === "function") {
      o = options.origin(request, response);

      if (o instanceof Promise) {
        o = await o;
      }

      if (!o) {
        // Safari (and potentially other browsers) need content-length 0,
        //   for 204 or they just hang waiting for a body
        (response.body as { status: number }).status = options
          .optionsSuccessStatus as number;
        response.headers.set("Content-Length", "0");

        return;
      }
    } else {
      // reflect origin
      o = isOriginAllowed(requestOrigin, options.origin) ? requestOrigin
      : false;
    }

    let c;

    if (typeof options.credentials === "function") {
      c = options.credentials(request, response);

      if (c instanceof Promise) {
        c = await c;
      }
    } else {
      c = !!options.credentials;
    }

    const headersSet: { [key: string]: string } = {};

    function set(key: string, value: string) {
      response.headers.set(key, value);
      headersSet[key] = value;
    }

    // If there is no Access-Control-Request-Method header or if parsing failed,
    // do not set any additional headers and terminate this set of steps.
    // The request is outside the scope of this specification.
    if (
      request.method !== "OPTIONS" ||
      !request.headers.get("Access-Control-Request-Method")
    ) {
      // Simple Cross-Origin Request, Actual Request, and Redirects
      set("Access-Control-Allow-Origin", o);

      if (c === true) {
        set("Access-Control-Allow-Credentials", "true");
      }

      if (typeof options.exposeHeaders === "string") {
        set("Access-Control-Expose-Headers", options.exposeHeaders);
      }
    } else if (options.preflight) {
      // Preflight Request
      response.headers.set("Access-Control-Allow-Origin", o);

      if (c === true) {
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }

      if (options.maxAge) {
        response.headers.set("Access-Control-Max-Age", options.maxAge);
      }

      if (typeof options.allowMethods === "string") {
        response.headers.set(
          "Access-Control-Allow-Methods",
          options.allowMethods,
        );
      }

      let aheaders = options.allowHeaders;

      if (!aheaders) {
        aheaders = request.headers.get("Access-Control-Request-Headers") ||
          undefined;
      }

      if (aheaders) {
        response.headers.set("Access-Control-Allow-Headers", aheaders);
      }

      (response.body as { status: number }).status = 204;
    }
  };
