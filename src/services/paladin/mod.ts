import { Drash } from "../deps.ts";

type ReferrerPolicy =
  | ""
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "same-origin"
  | "origin"
  | "strict-origin"
  | "origin-when-cross-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";

type HSTS = {
  max_age?: boolean | number;
  include_sub_domains?: boolean;
  preload?: boolean;
};

interface Configs {
  "X-XSS-Protection"?: boolean;
  "Referrer-Policy"?: ReferrerPolicy;
  "X-Content-Type-Options"?: boolean;
  hsts?: HSTS;
  "X-Powered-By"?: boolean | string;
  "X-Frame-Options"?: "DENY" | "SAMEORIGIN" | boolean | string // eg ALLOW-FROM www.example.com
  ;
  expect_ct?: {
    enforce?: boolean;
    max_age?: number;
    report_uri?: string;
  };
  "X-DNS-Prefetch-Control"?: boolean;
  "Content-Security-Policy"?: string;
}

/**
 * A middleware to help secure you applications, inspired by https://github.com/helmetjs/helmet.
 *
 * @param configs - See Configs
 */
export function Paladin(
  configs: Configs = {},
): (request: Drash.Http.Request, response?: Drash.Http.Response) => void {
  if (!configs.hsts) {
    configs.hsts = {};
  }
  if (!configs.expect_ct) {
    configs.expect_ct = {};
  }

  /**
   * The middleware function that's called by Drash.
   *
   * @param request - The request object.
   * @param response - (optional) The response object.
   */
  function paladin(
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ): void {
    // If there is a response, then we know this is occurring after the request
    if (response) {
      // Set "X-XSS-Protection" header. See https://helmetjs.github.io/docs/xss-filter/
      // if user explicitely enabled it, or left it
      if (
        configs["X-XSS-Protection"] === true ||
        configs["X-XSS-Protection"] !== false
      ) {
        response.headers.set(
          "X-XSS-Protection",
          "1; mode=block",
        );
      }

      // Set "Referrer-Policy" header if passed in. See https://helmetjs.github.io/docs/referrer-policy/
      if (configs["Referrer-Policy"]) {
        response.headers.set(
          "Referrer-Policy",
          configs["Referrer-Policy"],
        );
      }

      // Set the "X-Content-Type-Options" header. See https://helmetjs.github.io/docs/dont-sniff-mimetype/
      if (
        configs["X-Content-Type-Options"] === true ||
        configs["X-Content-Type-Options"] !== false
      ) {
        response.headers.set(
          "X-Content-Type-Options",
          "nosniff",
        );
      }

      // Set the "Strict-Transport-Security" header. See https://helmetjs.github.io/docs/hsts/
      let hstsHeader = "";
      if (typeof configs.hsts!.max_age === "number") { // use the config value
        hstsHeader += "max-age=" + configs.hsts!.max_age;
      } else if (configs.hsts!.max_age !== false) { // use the default value
        hstsHeader += "max-age=" + 5184000;
      }
      if (
        hstsHeader &&
        (configs.hsts!.include_sub_domains === true ||
          configs.hsts!.include_sub_domains !== false)
      ) {
        hstsHeader += "; include_sub_domains";
      }
      if (hstsHeader && configs.hsts!.preload === true) {
        hstsHeader += "; preload";
      }
      if (hstsHeader) {
        response.headers.set("Strict-Transport-Security", hstsHeader);
      }

      // Delete or modify the "X-Powered-By" header. See https://helmetjs.github.io/docs/hide-powered-by/
      if (typeof configs["X-Powered-By"] === "string") { // user wants to modify the header
        response.headers.set(
          "X-Powered-By",
          configs["X-Powered-By"] as string,
        );
      } else if (configs["X-Powered-By"] !== true) {
        response.headers.delete("X-Powered-By");
      }

      // Set the "X-Frame-Options" header. See https://helmetjs.github.io/docs/frameguard/
      if (typeof configs["X-Frame-Options"] === "string") {
        response.headers.set(
          "X-Frame-Options",
          configs["X-Frame-Options"] as string,
        );
      } else if (configs["X-Frame-Options"] !== false) {
        response.headers.set(
          "X-Frame-Options",
          "SAMEORIGIN",
        );
      }

      // Set the "Expect-CT" header. See https://helmetjs.github.io/docs/expect-ct/
      let expectCTHeader = "";
      if (configs.expect_ct!.max_age) {
        expectCTHeader += "max-age=" + configs.expect_ct!.max_age;
      }
      if (expectCTHeader && configs.expect_ct!.enforce === true) {
        expectCTHeader += "; enforce";
      }
      if (expectCTHeader && configs.expect_ct!.report_uri) {
        expectCTHeader += "; " + configs.expect_ct!.report_uri;
      }
      if (expectCTHeader) {
        response.headers.set("Expect-CT", expectCTHeader);
      }

      // Set the "X-DNS-Prefetch-Control" header. See https://helmetjs.github.io/docs/dns-prefetch-control/
      if (configs["X-DNS-Prefetch-Control"] === true) {
        response.headers.set("X-DNS-Prefetch-Control", "on");
      } else {
        response.headers.set("X-DNS-Prefetch-Control", "off");
      }

      // Set the "Content-Security-Policy" header. See https://helmetjs.github.io/docs/csp/
      if (configs["Content-Security-Policy"]) {
        response.headers.set(
          "Content-Security-Policy",
          configs["Content-Security-Policy"],
        );
      }
    }
  }

  // Expose the configs in case the user wants to do anything with them
  paladin.configs = configs;

  return paladin;
}
