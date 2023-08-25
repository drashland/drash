/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
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
import { IResource } from "../../core/Interfaces.ts";

// Imports > Standard
import { GroupConsoleLogger, Level } from "../log/GroupConsoleLogger.ts";
import { Handler } from "../handlers/Handler.ts";

type Input = {
  request: { url: string };
  resource: IResource;
  request_params: {
    path_params: Record<string, string | undefined>;
  };
};

type Output = {
  request: Input["request"] & { params: Params };
  resource: IResource;
};

class RequestParamsParser extends Handler<Input, Promise<Output>> {
  #logger = GroupConsoleLogger.create("RequestValidator", Level.Debug);

  handle(input: Input): Promise<Output> {
    this.#logger.debug(`Parsing request path params`);

    return Promise
      .resolve()
      .then(() => this.#validateInput(input))
      .then(() => this.#addParams(input.request, input.request_params))
      .then(() =>
        super.nextHandler({
          request: input.request,
          resource: input.resource,
        } as Output)
      );
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

class Params {
  #query: URLSearchParams;
  #path_params: Record<string, string | undefined>;

  constructor(
    request: Input["request"],
    params: Input["request_params"],
  ) {
    this.#query = new URLSearchParams(request);
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

export { type Input, type Output, RequestParamsParser };
