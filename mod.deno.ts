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

import { RequestHandlerBuilder } from "./src/core/builders/RequestHandlerBuilder.ts";
import * as Interfaces from "./src/core/Interfaces.ts";
import * as Types from "./src/core/Types.ts";
import * as Enums from "./src/core/Enums.ts";

export { ErrorHandler } from "./src/core/handlers/ErrorHandler.ts";
export { ResourceWithServices as Resource } from "./src/core/http/ResourceWithServices.ts";
export { HTTPError } from "./src/core/Errors/HTTPError.ts";

export type {
  DrashRequest as Request,
  RequestHandler,
  ResponseBuilder as Response,
} from "./src/core/Interfaces.ts";

export type { Interfaces, Types };

/**
 * Create a request handler to route `Request` objects through.
 *
 * @param options See `Types.RequestHandlerOptions`.
 * @returns An instance of Drash's `RequestHandler`.
 */
export async function createRequestHandler(
  options?: Types.RequestHandlerOptions,
): Promise<{
  handleRequest: (request: Request) => Promise<Response>
}> {
  const builder = new RequestHandlerBuilder(options);
  await builder.runServicesAtStartup();
  return builder.build();
}
