import { Drash } from "../deps.ts";

type ReferrerPolicy =
  "" |
  "no-referrer" |
  "no-referrer-when-downgrade" |
  "same-origin" |
  "origin" |
  "strict-origin" |
  "origin-when-cross-origin" |
  "strict-origin-when-cross-origin" |
  "unsafe-url"

interface Configs {
  "X-XSS-Protection"?: boolean
  "Referrer-Policy"?: ReferrerPolicy,
  "X-Content-Type-Options"?: boolean
  hsts?: {
    maxAge?: boolean | number,
    includeSubDomains?: boolean,
    preload?: boolean
  },
  "X-Powered-By"?: boolean | string
  "X-Frame-Options"?: "DENY" | "SAMEORIGIN" | boolean | string, // eg ALLOW-FROM www.example.com
  expectCt?: {
    enforce?: boolean,
    maxAge?: number,
    reportUri?: string
  },
  "X-DNS-Prefetch-Control"?: boolean,
  "Content-Security-Policy"?: string
}

/**
 * A logger middleware inspired by https://www.npmjs.com/package/morgan.
 *
 * @param configs - See IDexterConfigs
 */
export function Paladin(
  configs?: Configs,
) {

  if (!configs) {
    configs = {}
  }
  if (!configs.hsts) {
    configs.hsts = {}
  }
  if (!configs.expectCt) {
    configs.expectCt = {}
  }

  // Default configs when no `configs` param is passed in
  const defaultConfigs = {
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    hsts: {
      maxAge: 5184000, // 60 days
      includeSubDomains: "includeSubDomains"
    },
    "X-Powered-By": false, // False for removing the header
    "X-Frame-Options": "SAMEORIGIN",
    "X-DNS-Prefetch-Control": false
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

    // If there is no response, then we know this is occurring before the request
    if (!response) {
      // But we don't care about this. We want to set the headers on the response
      // So yeet this conditional
    }

    // If there is a response, then we know this is occurring after the request
    if (response) {

      // Set "X-XSS-Protection" header. See https://helmetjs.github.io/docs/xss-filter/
      if (configs!["X-XSS-Protection"] !== false) {
        response.headers.set("X-XSS-Protection", defaultConfigs["X-XSS-Protection"])
        configs!["X-XSS-Protection"] = true
      }

      // Set "Referrer-Policy" header if passed in. See https://helmetjs.github.io/docs/referrer-policy/
      if (configs!["Referrer-Policy"]) {
        response.headers.set("Referrer-Policy", configs!["Referrer-Policy"].toString())
      }

      // Set the "X-Content-Type-Options" header. See https://helmetjs.github.io/docs/dont-sniff-mimetype/
      if (configs!["X-Content-Type-Options"] !== false) {
        response.headers.set("X-Content-Type-Options", defaultConfigs["X-Content-Type-Options"])
        configs!["X-Content-Type-Options"] = true
      }

      // Set the "Strict-Transport-Security" header. See https://helmetjs.github.io/docs/hsts/
      let hstsHeader = ""
      if (configs!.hsts!.maxAge) { // if set to a number
        hstsHeader += "max-age=" + configs!.hsts!.maxAge
      } else if (configs!.hsts!.maxAge !== false) { // not disabled
        hstsHeader += "max-age=" + defaultConfigs.hsts.maxAge
      }
      if (hstsHeader && configs!.hsts!.includeSubDomains === true) {
        hstsHeader += "; includeSubDomains"
      } else if (hstsHeader && configs!.hsts!.includeSubDomains  !== false) {
        hstsHeader += "; includeSubDomains"
      }
      if (hstsHeader && configs!.hsts!.preload === true) {
        hstsHeader += "; preload"
      }
      // } else if (hstsHeader && configs!.hsts!.preload !== false) {
      //   hstsHeader += "; preload"
      // }
      if (hstsHeader) {
        response.headers.set("Strict-Transport-Security", hstsHeader)
      }
      configs!.hsts = {
        preload: configs!.hsts!.preload ?? false,
        maxAge: configs!.hsts!.maxAge ?? defaultConfigs.hsts.maxAge,
        includeSubDomains: !!configs!.hsts!.includeSubDomains ?? !!defaultConfigs.hsts.includeSubDomains
      }

      // Delete or modify the "X-Powered-By" header. See https://helmetjs.github.io/docs/hide-powered-by/
      if (typeof configs!["X-Powered-By"] === "string") { // user wants to modify the header
        response.headers.set("X-Powered-By", configs!["X-Powered-By"].toString())
      } else if (configs!["X-Powered-By"] !== true && defaultConfigs["X-Powered-By"] === false) {
        response.headers.delete("X-Powered-By")
        configs!["X-Powered-By"] = false
      }

      // Set the "X-Frame-Options" header. See https://helmetjs.github.io/docs/frameguard/
      if (configs!["X-Frame-Options"] && typeof configs!["X-Frame-Options"] === "string") {
        response.headers.set("X-Frame-Options", configs!["X-Frame-Options"].toString())
      } else if (configs!["X-Frame-Options"] !== false) {
        response.headers.set("X-Frame-Options", defaultConfigs["X-Frame-Options"])
        configs!["X-Frame-Options"] = defaultConfigs["X-Frame-Options"]
      }

      // Set the "Expect-CT" header. See https://helmetjs.github.io/docs/expect-ct/
      let expectCtHeader = ""
      if (configs!.expectCt!.maxAge) {
        expectCtHeader += "max-age=" + configs!.expectCt!.maxAge
      }
      if (expectCtHeader && configs!.expectCt!.enforce === true) {
        expectCtHeader += "; enforce"
      }
      if (expectCtHeader && configs!.expectCt!.reportUri) {
        expectCtHeader += "; " + configs!.expectCt!.reportUri
      }
      if (expectCtHeader) {
        response.headers.set("Expect-CT", expectCtHeader)
      }
      configs!.expectCt = {
        maxAge: configs!.expectCt!.maxAge ?? 0,
        enforce: configs!.expectCt!.enforce ?? false,
        reportUri: configs!.expectCt!.reportUri ?? ''
      }

      // Set the "X-DNS-Prefetch-Control" header. See https://helmetjs.github.io/docs/dns-prefetch-control/
      if (configs!["X-DNS-Prefetch-Control"] === true) {
        response.headers.set("X-DNS-Prefetch-Control", "on")
      } else {
        response.headers.set("X-DNS-Prefetch-Control", "off")
        configs!["X-XSS-Protection"] = false
      }

      // Set the "Content-Security-Policy" header. See https://helmetjs.github.io/docs/csp/
      if (configs!["Content-Security-Policy"]) {
        response.headers.set("Content-Security-Policy", configs!["Content-Security-Policy"])
      }

    }
  }

  // Expose the configs in case the user wants to do anything with them
  paladin.configs = configs;

  return paladin;
}
