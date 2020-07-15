import { Drash } from "../deps.ts";

enum ReferrerPolicy {
  "",
  "no-referrer",
  "no-referrer-when-downgrade",
  "same-origin",
  "origin",
  "strict-origin",
  "origin-when-cross-origin",
  "strict-origin-when-cross-origin",
  "unsafe-url"
};

interface Configs {
  "X-XSS-Protection": boolean
  "Referrer-Policy": ReferrerPolicy
}

/**
 * A logger middleware inspired by https://www.npmjs.com/package/morgan.
 *
 * @param configs - See IDexterConfigs
 */
export function Armor(
  configs?: Configs,
) {

  // Default configs when no `configs` param is passed in
  const defaultConfigs = {
    "X-XSS-Protection": "1; mode=block"
  };

  /**
   * The middleware function that's called by Drash.
   *
   * @param request - The request object.
   * @param response - (optional) The response object.
   */
  function armor(
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ): void {

    // If there is no response, then we know this is occurring before the request
    if (!response) {
      // But we don't care about this. We want to set the headers on the response
      // So yeet this conditional
    }

    // If there is a response, then we know this is occurring after the request
    if (response) {

      // Set "X-XSS-Protection" header. See https://helmetjs.github.io/docs/xss-filter/
      if (configs["X-XSS-Protection"] !== false) {
        response.headers.set("X-XSS-Protection", defaultConfigs["X-XSS-Protection"])
      }

      // Set "Referrer-Policy" header. See https://helmetjs.github.io/docs/referrer-policy/
      if (configs["Referrer-Policy"]) {
        response.headers.set("Referrer-Policy", configs["Referrer-Policy"])
      }

    }
  }

  // Expose the configs in case the user wants to do anything with them
  armor.configs = configs;

  return armor;
}
