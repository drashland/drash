/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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

// Imports > Core
import { Resource } from "../../core/http/Resource.ts";

// Imports > Standard
import { Handler } from "../handlers/Handler.ts";

type Input = {
  request: { url: string };
  resource: Resource;
  request_params: {
    path_params: Record<string, string | undefined>;
  };
};

type Output = {
  request: Input["request"] & { params: Params };
  resource: Resource;
};

type WithParams = Request & { params: Params };

class RequestParamsParser extends Handler {
  override handle<Output>(input: Input): Promise<Output> {
    return Promise
      .resolve()
      .then(() => this.#validateInput(input))
      .then(() => this.#addParams(input.request, input.request_params))
      .then(() => {
        const { request, resource } = input;

        const nextHandlerInput = { request, resource };

        return super.sendToNextHandler<Output>(nextHandlerInput);
      });
  }

  /**
   * Add the given `requestParams` to the given `request`.
   * @param request
   * @param params
   */
  #addParams(
    request: Input["request"],
    requestParams: Input["request_params"],
  ): void {
    Object.defineProperty(request, "params", {
      value: new Params(
        request,
        requestParams,
      ),
    });
  }

  /**
   * Validate the input is the expected type.
   * @param input The input passed to `this.handle()`.
   */
  #validateInput(input: unknown): void {
    if (!input || typeof input !== "object") {
      throw new Error("Input received is not an object");
    }

    if (
      !("request" in input) || !input.request ||
      typeof input.request !== "object"
    ) {
      throw new Error("Input request received is not an object");
    }

    if (!("url" in input.request) || typeof input.request.url !== "string") {
      throw new Error("Input request URL could not be read");
    }

    if (!("resource" in input) || typeof input.resource !== "object") {
      throw new Error("Input resource received is not an object");
    }
  }
}

/**
 * Read the query string out of the given URL.
 *
 * Neither of the shorter spellings works here:
 *
 * - `new URLSearchParams(url)` parses its argument as
 *   `application/x-www-form-urlencoded`. That splits on `&`, not on `?`, so the
 *   origin and path are absorbed into the *first* param's name:
 *   `new URLSearchParams("http://x/users?a=1&b=2")` yields the key
 *   `"http://x/users?a"`, leaving `a` unreadable. Every later param still
 *   parses, which is what made this hard to spot.
 * - `new URL(url).searchParams` throws on a relative URL. `URLPattern.exec()`
 *   matches those, so `ResourcesIndex` lets them through and they reach this
 *   handler. Throwing here would turn a request that works today into a hard
 *   failure.
 *
 * @param url The request's URL. May be relative.
 * @returns The query params, empty if the URL carries no query string.
 */
function toSearchParams(url: string): URLSearchParams {
  // Cut the fragment first so a `?` inside it is not mistaken for the start of
  // the query string. Fragments are never sent to a server, but `url` is
  // caller-supplied in the runtimes that pass a context object.
  const fragmentStart = url.indexOf("#");
  const withoutFragment = fragmentStart === -1
    ? url
    : url.slice(0, fragmentStart);

  const queryStart = withoutFragment.indexOf("?");

  if (queryStart === -1) {
    return new URLSearchParams();
  }

  return new URLSearchParams(withoutFragment.slice(queryStart + 1));
}

class Params {
  #query: URLSearchParams;
  #path_params: Record<string, string | undefined>;

  constructor(
    request: Input["request"],
    params: Input["request_params"],
  ) {
    this.#query = toSearchParams(request.url);
    this.#path_params = params.path_params;
  }

  public queryParam(param: string): string | undefined {
    return this.#query.get(param) ?? undefined;
  }

  public pathParam(param: string): string | undefined {
    return this.#path_params[param];
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Input, type Output, RequestParamsParser, type WithParams };
