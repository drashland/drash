/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
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

// Imports > Standard
import { GroupConsoleLogger } from "../log/GroupConsoleLogger.ts";
import { AbstractHandler } from "./AbstractHandler.ts";

class RequestParamsParser<I> extends AbstractHandler {
  #logger = GroupConsoleLogger.create("RequestValidator");

  handle(request: I, options: { path_params: Record<string, string> }): I {
    this.#logger.debug(`Parsing request path params`);

    Object.defineProperty(request, "params", {
      value: new Params(request, options),
    });

    return request;
  }
}

class Params {
  #query: URLSearchParams;
  #path_params: Record<string, string>;

  constructor(
    request: unknown,
    options: { path_params: Record<string, string> },
  ) {
    this.#query = new URLSearchParams((request as { url: string }).url);
    this.#path_params = options.path_params;
  }

  public queryParam(param: string): string | undefined {
    return this.#query.get(param) ?? undefined;
  }

  public pathParam(param: string): string {
    return this.#path_params[param];
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { RequestParamsParser };
