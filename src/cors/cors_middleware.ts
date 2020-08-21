import { Drash, ServerRequest, vary } from "../../deps.ts";

type CorsMiddlewareConfig = {
  origin?:
    | ((
      request: any,
      response: Drash.Http.Response,
    ) => string | Promise<string>)
    | string;
  credentials?:
    | ((
      request: any,
      response: Drash.Http.Response,
    ) => boolean | Promise<boolean>)
    | boolean;
  exposeHeaders?: string | string[];
  allowMethods?: string | string[];
  allowHeaders?: string | string[];
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
};

type CorsMiddlewareOptions = {
  origin?:
    | ((
      request: any,
      response: Drash.Http.Response,
    ) => string | Promise<string>)
    | string;
  credentials?:
    | ((
      request: any,
      response: Drash.Http.Response,
    ) => boolean | Promise<boolean>)
    | boolean;
  exposeHeaders?: string;
  allowMethods?: string;
  allowHeaders?: string;
  maxAge?: string;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
};

export const CorsMiddleware = ({
  origin,
  credentials,
  exposeHeaders,
  allowMethods,
  allowHeaders,
  maxAge,
  preflightContinue,
  optionsSuccessStatus,
}: CorsMiddlewareConfig = {}) =>
  async (
    request: ServerRequest,
    response: Drash.Http.Response,
  ): Promise<void> => {
    let options: CorsMiddlewareOptions = {
      origin: "*",
      allowMethods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: false,
    };

    options = {
      ...options,
      ...{
        origin,
        credentials,
        preflightContinue,
        optionsSuccessStatus,
      },
    };

    if (Array.isArray(exposeHeaders)) {
      options.exposeHeaders = exposeHeaders.join(",");
    }

    if (Array.isArray(allowMethods)) {
      options.allowMethods = allowMethods.join(",");
    }

    if (Array.isArray(allowHeaders)) {
      options.allowHeaders = allowHeaders.join(",");
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
      "Origin",
    );

    if (!requestOrigin) {
      return;
    }

    let o;

    if (typeof options.origin === "function") {
      o = options.origin(request, response);

      if (o instanceof Promise) {
        o = await o;
      }

      if (!o) {
        // Safari (and potentially other browsers) need content-length 0,
        //   for 204 or they just hang waiting for a body
        response.body.status = options.optionsSuccessStatus;
        response.headers.set("Content-Length", "0");

        return;
      }
    } else {
      o = options.origin || requestOrigin;
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

      if (options.exposeHeaders) {
        set("Access-Control-Expose-Headers", options.exposeHeaders);
      }
    } else {
      // Preflight Request
      response.headers.set("Access-Control-Allow-Origin", o);

      if (c === true) {
        response.headers.set("Access-Control-Allow-Credentials", "true");
      }

      if (options.maxAge) {
        response.headers.set("Access-Control-Max-Age", options.maxAge);
      }

      if (options.allowMethods) {
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

      response.body.status = 204;
    }
  };
