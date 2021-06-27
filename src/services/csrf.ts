import { Drash } from "../deps.ts";
import { createHash, v4 } from "./deps.ts";

/**
 * This allows us to pass the TS compiler, so we can add properties to a method that uses it. See `csrf` method below
 */
interface F {
  (): void;
  token: string;
}

const primaryToken = createHash("sha512");
primaryToken.update(v4.generate());
const primaryTokenString = primaryToken.toString();

type Options = {
  cookie?: boolean;
};

const defaultOptions: Options = {
  cookie: false,
};

export function CSRF(options: Options = defaultOptions) {
  const csrf = <F> function csrf(
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ): void {
    if (response) {
      let requestToken: string | null = "";

      if (options.cookie === true) {
        requestToken = request.getCookie("X-CSRF-TOKEN");
      } else {
        requestToken = request.headers.get("X-CSRF-TOKEN");
      }

      if (!requestToken) {
        throw new Drash.Exceptions.HttpMiddlewareException(
          400,
          "No CSRF token was passed in",
        );
      }

      if (requestToken !== primaryTokenString) {
        throw new Drash.Exceptions.HttpMiddlewareException(
          403,
          "The CSRF tokens do not match",
        );
      }
    }
  };

  csrf.token = primaryTokenString; // or const csrf = Object.assign(oldCsrf, { token: primaryToken.toString() })

  return csrf;
}
