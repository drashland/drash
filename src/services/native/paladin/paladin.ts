/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
 * Copyright (C) 2022  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

import { Request, Response } from "../../../mod.deno.ts";

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
export class PaladinService {
  readonly #configs: Configs;
  constructor(configs: Configs = {}) {
    if (!configs.hsts) {
      configs.hsts = {};
    }
    if (!configs.expect_ct) {
      configs.expect_ct = {};
    }
    this.#configs = configs;
  }

  runAfterResource(_request: Request, response: Response) {
    // Set "X-XSS-Protection" header. See https://helmetjs.github.io/docs/xss-filter/
    // if user explicitely enabled it, or left it
    if (
      this.#configs["X-XSS-Protection"] === true ||
      this.#configs["X-XSS-Protection"] !== false
    ) {
      response.headers({
        "X-XSS-Protection": "1; mode=block",
      });
    }

    // Set "Referrer-Policy" header if passed in. See https://helmetjs.github.io/docs/referrer-policy/
    if (this.#configs["Referrer-Policy"]) {
      response.headers({
        "Referrer-Policy": this.#configs["Referrer-Policy"],
      });
    }

    // Set the "X-Content-Type-Options" header. See https://helmetjs.github.io/docs/dont-sniff-mimetype/
    if (
      this.#configs["X-Content-Type-Options"] === true ||
      this.#configs["X-Content-Type-Options"] !== false
    ) {
      response.headers({
        "X-Content-Type-Options": "nosniff",
      });
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
      response.headers({
        "Strict-Transport-Security": hstsHeader,
      });
    }

    // Delete or modify the "X-Powered-By" header. See https://helmetjs.github.io/docs/hide-powered-by/
    if (typeof this.#configs["X-Powered-By"] === "string") { // user wants to modify the header
      response.headers({
        "X-Powered-By": this.#configs["X-Powered-By"] as string,
      });
    } else if (this.#configs["X-Powered-By"] !== true) {
      response.headers_init?.delete("X-Powered-By");
    }

    // Set the "X-Frame-Options" header. See https://helmetjs.github.io/docs/frameguard/
    if (typeof this.#configs["X-Frame-Options"] === "string") {
      response.headers({
        "X-Frame-Options": this.#configs["X-Frame-Options"] as string,
      });
    } else if (this.#configs["X-Frame-Options"] !== false) {
      response.headers({
        "X-Frame-Options": "SAMEORIGIN",
      });
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
      response.headers({
        "Expect-CT": expectCTHeader,
      });
    }

    // Set the "X-DNS-Prefetch-Control" header. See https://helmetjs.github.io/docs/dns-prefetch-control/
    if (this.#configs["X-DNS-Prefetch-Control"] === true) {
      response.headers({
        "X-DNS-Prefetch-Control": "on",
      });
    } else {
      response.headers({
        "X-DNS-Prefetch-Control": "off",
      });
    }

    // Set the "Content-Security-Policy" header. See https://helmetjs.github.io/docs/csp/
    if (this.#configs["Content-Security-Policy"]) {
      response.headers({
        "Content-Security-Policy": this.#configs["Content-Security-Policy"],
      });
    }
  }
}
