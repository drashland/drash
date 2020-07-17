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

interface Configs {
  "X-XSS-Protection"?: boolean;
  "Referrer-Policy"?: ReferrerPolicy;
  "X-Content-Type-Options"?: boolean;
  hsts?: {
    max_age?: boolean | number;
    include_sub_domains?: boolean;
    preload?: boolean;
  };
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
 * A logger middleware inspired by https://www.npmjs.com/package/morgan.
 *
 * @param configs - See IDexterConfigs
 */
export function Paladin(
  configs: Configs = {},
) {

  if (!configs.hsts) {
    configs.hsts = {};
  }
  if (!configs.expect_ct) {
    configs.expect_ct = {};
  }

  // Default configs when no `configs` param is passed in
  const defaultConfigs = {
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    hsts: {
      max_age: 5184000, // 60 days
      include_sub_domains: "include_sub_domains",
    },
    "X-Powered-By": false, // False for removing the header
    "X-Frame-Options": "SAMEORIGIN",
    "X-DNS-Prefetch-Control": false,
  };

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
      if (configs["X-XSS-Protection"] !== false) {
        response.headers.set(
          "X-XSS-Protection",
          defaultConfigs["X-XSS-Protection"],
        );
        configs["X-XSS-Protection"] = true;
      }

      // Set "Referrer-Policy" header if passed in. See https://helmetjs.github.io/docs/referrer-policy/
      if (configs["Referrer-Policy"]) {
        response.headers.set(
          "Referrer-Policy",
          configs["Referrer-Policy"].toString(),
        );
      }

      // Set the "X-Content-Type-Options" header. See https://helmetjs.github.io/docs/dont-sniff-mimetype/
      if (configs["X-Content-Type-Options"] !== false) {
        response.headers.set(
          "X-Content-Type-Options",
          defaultConfigs["X-Content-Type-Options"],
        );
        configs["X-Content-Type-Options"] = true;
      }

      // Set the "Strict-Transport-Security" header. See https://helmetjs.github.io/docs/hsts/
      let hstsHeader = "";
      if (configs.hsts!.max_age) { // if set to a number
        hstsHeader += "max-age=" + configs.hsts!.max_age;
      } else if (configs.hsts!.max_age !== false) { // not disabled
        hstsHeader += "max-age=" + defaultConfigs.hsts.max_age;
      }
      if (hstsHeader && configs.hsts!.include_sub_domains === true) {
        hstsHeader += "; include_sub_domains";
      } else if (hstsHeader && configs.hsts!.include_sub_domains !== false) {
        hstsHeader += "; include_sub_domains";
      }
      if (hstsHeader && configs.hsts!.preload === true) {
        hstsHeader += "; preload";
      }
      // } else if (hstsHeader && configs.hsts!.preload !== false) {
      //   hstsHeader += "; preload"
      // }
      if (hstsHeader) {
        response.headers.set("Strict-Transport-Security", hstsHeader);
      }
      configs.hsts = {
        preload: configs.hsts!.preload ?? false,
        max_age: configs.hsts!.max_age ?? defaultConfigs.hsts.max_age,
        include_sub_domains: !!configs.hsts!.include_sub_domains ??
          !!defaultConfigs.hsts.include_sub_domains,
      };

      // Delete or modify the "X-Powered-By" header. See https://helmetjs.github.io/docs/hide-powered-by/
      if (typeof configs["X-Powered-By"] === "string") { // user wants to modify the header
        response.headers.set(
          "X-Powered-By",
          configs["X-Powered-By"].toString(),
        );
      } else if (
        configs["X-Powered-By"] !== true &&
        defaultConfigs["X-Powered-By"] === false
      ) {
        response.headers.delete("X-Powered-By");
        configs["X-Powered-By"] = false;
      }

      // Set the "X-Frame-Options" header. See https://helmetjs.github.io/docs/frameguard/
      if (
        configs["X-Frame-Options"] &&
        typeof configs["X-Frame-Options"] === "string"
      ) {
        response.headers.set(
          "X-Frame-Options",
          configs["X-Frame-Options"].toString(),
        );
      } else if (configs["X-Frame-Options"] !== false) {
        response.headers.set(
          "X-Frame-Options",
          defaultConfigs["X-Frame-Options"],
        );
        configs["X-Frame-Options"] = defaultConfigs["X-Frame-Options"];
      }

      // Set the "Expect-CT" header. See https://helmetjs.github.io/docs/expect-ct/
      let expect_ctHeader = "";
      if (configs.expect_ct!.max_age) {
        expect_ctHeader += "max-age=" + configs.expect_ct!.max_age;
      }
      if (expect_ctHeader && configs.expect_ct!.enforce === true) {
        expect_ctHeader += "; enforce";
      }
      if (expect_ctHeader && configs.expect_ct!.report_uri) {
        expect_ctHeader += "; " + configs.expect_ct!.report_uri;
      }
      if (expect_ctHeader) {
        response.headers.set("Expect-CT", expect_ctHeader);
      }
      configs.expect_ct = {
        max_age: configs.expect_ct!.max_age ?? 0,
        enforce: configs.expect_ct!.enforce ?? false,
        report_uri: configs.expect_ct!.report_uri ?? "",
      };

      // Set the "X-DNS-Prefetch-Control" header. See https://helmetjs.github.io/docs/dns-prefetch-control/
      if (configs["X-DNS-Prefetch-Control"] === true) {
        response.headers.set("X-DNS-Prefetch-Control", "on");
      } else {
        response.headers.set("X-DNS-Prefetch-Control", "off");
        configs["X-XSS-Protection"] = false;
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
