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

import { RequestHandler } from "././src/node/handlers/request_handler.ts";
import * as Interfaces from "./src/core/interfaces.ts";
import * as Types from "./src/core/types.ts";

export { ErrorHandler } from "./src/core/handlers/error_handler.ts";
export { Resource } from "./src/node/http/resource.ts";
export * as Enums from "./src/core/enums.ts";
export * as Errors from "./src/core/http/errors.ts";

export type {
  ResponseBuilder as Response,
  RequestHandler,
} from "./src/core/interfaces.ts";

export type { Interfaces, Types };

/**
 * Create a request handler to route `Request` objects through.
 *
 * @param options See `Types.RequestHandlerOptions`.
 * @returns An instance of Drash's `RequestHandler`.
 */
export async function createRequestHandler(
  options?: Types.RequestHandlerOptions<unknown, unknown, unknown, any>,
): Promise<Interfaces.RequestHandler<unknown, unknown, unknown, any>> {
  const r = new RequestHandler(options);
  await r.runServicesAtStartup();
  // @ts-ignore: Need Node interface
  return r;
}
