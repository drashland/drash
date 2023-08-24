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

// Imports > Core
import { IResource } from "../../../core/Interfaces.ts";

// Imports > Standard
import { GroupConsoleLogger, Level } from "../../../standard/log/GroupConsoleLogger.ts";
import { Handler } from "../../../standard/handlers/Handler.ts";

type ParamsOptions = {
  path_params: Record<string, string>;
}

interface RequestWithParams {
  params: Params;
}

type Input = {
  request: { url: string },
  resource: IResource;
  path_params: Record<string, string | undefined>;
}

type Output = {
  request: Input["request"] & { params: Params },
  resource: IResource,
};

class RequestParamsParser<O = unknown> extends Handler<Promise<O>> {
  #logger = GroupConsoleLogger.create("RequestValidator", Level.Debug);

  handle(input: Input): Promise<O> {
    this.#logger.debug(`Parsing request path params`);

    return Promise
      .resolve()
      .then(() => this.#validate(input))
      .then(() => this.#addParams(input))
      .then(() => super.handle({
        request: input.request as unknown as Output,
        resource: input.resource,
      }));
  }

  #addParams(input: Input): void {
    Object.defineProperty(input.request, "params", {
      value: new Params(
        input.request,
        {
          path_params: input.path_params
        }
      ),
    });
  }

  #validate(input: unknown): void {
    if (!input || typeof input !== "object") {
      throw new Error("Input received is not an object");
    }

    if (!("request" in input) || !input.request || typeof input.request !== "object") {
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
    options: Pick<Input, "path_params">,
  ) {
    this.#query = new URLSearchParams(request);
    this.#path_params = options.path_params;
  }

  public queryParam(param: string): string | undefined {
    return this.#query.get(param) ?? undefined;
  }

  public pathParam(param: string): string | undefined {
    return this.#path_params[param];
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { RequestParamsParser };
