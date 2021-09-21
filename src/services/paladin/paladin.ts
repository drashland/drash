import { IContext, IService, Service } from "../../../mod.ts";

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
  // deno-lint-ignore camelcase
  max_age?: boolean | number;
  // deno-lint-ignore camelcase
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
  // deno-lint-ignore camelcase
  expect_ct?: {
    enforce?: boolean;
    // deno-lint-ignore camelcase
    max_age?: number;
    // deno-lint-ignore camelcase
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
export class PaladinService extends Service implements IService {
  readonly #configs: Configs;
  constructor(configs: Configs = {}) {
    super();
    if (!configs.hsts) {
      configs.hsts = {};
    }
    if (!configs.expect_ct) {
      configs.expect_ct = {};
    }
    this.#configs = configs;
  }

  runAfterResource(context: IContext) {
    // Set "X-XSS-Protection" header. See https://helmetjs.github.io/docs/xss-filter/
    // if user explicitely enabled it, or left it
    if (
      this.#configs["X-XSS-Protection"] === true ||
      this.#configs["X-XSS-Protection"] !== false
    ) {
      context.response.headers.set(
        "X-XSS-Protection",
        "1; mode=block",
      );
    }

    // Set "Referrer-Policy" header if passed in. See https://helmetjs.github.io/docs/referrer-policy/
    if (this.#configs["Referrer-Policy"]) {
      context.response.headers.set(
        "Referrer-Policy",
        this.#configs["Referrer-Policy"],
      );
    }

    // Set the "X-Content-Type-Options" header. See https://helmetjs.github.io/docs/dont-sniff-mimetype/
    if (
      this.#configs["X-Content-Type-Options"] === true ||
      this.#configs["X-Content-Type-Options"] !== false
    ) {
      context.response.headers.set(
        "X-Content-Type-Options",
        "nosniff",
      );
    }

    // Set the "Strict-Transport-Security" header. See https://helmetjs.github.io/docs/hsts/
    let hstsHeader = "";
    if (typeof this.#configs.hsts!.max_age === "number") { // use the config value
      hstsHeader += "max-age=" + this.#configs.hsts!.max_age;
    } else if (this.#configs.hsts!.max_age !== false) { // use the default value
      hstsHeader += "max-age=" + 5184000;
    }
    if (
      hstsHeader &&
      (this.#configs.hsts!.include_sub_domains === true ||
        this.#configs.hsts!.include_sub_domains !== false)
    ) {
      hstsHeader += "; include_sub_domains";
    }
    if (hstsHeader && this.#configs.hsts!.preload === true) {
      hstsHeader += "; preload";
    }
    if (hstsHeader) {
      context.response.headers.set("Strict-Transport-Security", hstsHeader);
    }

    // Delete or modify the "X-Powered-By" header. See https://helmetjs.github.io/docs/hide-powered-by/
    if (typeof this.#configs["X-Powered-By"] === "string") { // user wants to modify the header
      context.response.headers.set(
        "X-Powered-By",
        this.#configs["X-Powered-By"] as string,
      );
    } else if (this.#configs["X-Powered-By"] !== true) {
      context.response.headers.delete("X-Powered-By");
    }

    // Set the "X-Frame-Options" header. See https://helmetjs.github.io/docs/frameguard/
    if (typeof this.#configs["X-Frame-Options"] === "string") {
      context.response.headers.set(
        "X-Frame-Options",
        this.#configs["X-Frame-Options"] as string,
      );
    } else if (this.#configs["X-Frame-Options"] !== false) {
      context.response.headers.set(
        "X-Frame-Options",
        "SAMEORIGIN",
      );
    }

    // Set the "Expect-CT" header. See https://helmetjs.github.io/docs/expect-ct/
    let expectCTHeader = "";
    if (this.#configs.expect_ct!.max_age) {
      expectCTHeader += "max-age=" + this.#configs.expect_ct!.max_age;
    }
    if (expectCTHeader && this.#configs.expect_ct!.enforce === true) {
      expectCTHeader += "; enforce";
    }
    if (expectCTHeader && this.#configs.expect_ct!.report_uri) {
      expectCTHeader += "; " + this.#configs.expect_ct!.report_uri;
    }
    if (expectCTHeader) {
      context.response.headers.set("Expect-CT", expectCTHeader);
    }

    // Set the "X-DNS-Prefetch-Control" header. See https://helmetjs.github.io/docs/dns-prefetch-control/
    if (this.#configs["X-DNS-Prefetch-Control"] === true) {
      context.response.headers.set("X-DNS-Prefetch-Control", "on");
    } else {
      context.response.headers.set("X-DNS-Prefetch-Control", "off");
    }

    // Set the "Content-Security-Policy" header. See https://helmetjs.github.io/docs/csp/
    if (this.#configs["Content-Security-Policy"]) {
      context.response.headers.set(
        "Content-Security-Policy",
        this.#configs["Content-Security-Policy"],
      );
    }
  }
}
