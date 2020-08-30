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

export function CSRF() {
  const csrf = <F> function csrf(
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ): void {
    if (response) {
      const requestToken = request.headers.get("X-CSRF-TOKEN");

      if (!requestToken) {
        throw new Drash.Exceptions.HttpMiddlewareException(
          403,
          "No CSRF token was passed in",
        );
      }

      if (requestToken !== primaryTokenString) {
        throw new Drash.Exceptions.HttpMiddlewareException(
          400,
          "The CSRF tokens do match",
        );
      }
    }
  };

  csrf.token = primaryTokenString; // or const csrf = Object.assign(oldCsrf, { token: primaryToken.toString() })

  return csrf;
}
