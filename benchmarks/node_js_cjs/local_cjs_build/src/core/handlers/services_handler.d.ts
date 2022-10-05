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
import * as Interfaces from "../interfaces.js";
import * as Types from "../types.js";
/**
 * Base class for services handlers.
 */
export declare class ServicesHandler<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> {
  #private;
  /**
   * @param services - An array of services this instance can run.
   */
  constructor(
    services: Interfaces.Service<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >[],
  );
  /**
   * Does this service handler have methods of the given `method` defined?
   * @param method - See {@link Types.ServiceMethod}.
   * @returns True if yes, false if no.
   */
  hasServices(method: Types.ServiceMethod): boolean;
  /**
   * Run all services that have `runAfterResource` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  runAfterResourceServices(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
  ): Promise<void>;
  /**
   * Run all services that have `runBeforeResource` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  runBeforeResourceServices(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
  ): Promise<void>;
  /**
   * Run all services that have the `runOnError` method defined.
   * @param context
   */
  runOnErrorServices(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
  ): Promise<void>;
  /**
   * Run all services that have `runAtStartup` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  runStartupServices(
    context: Types.ContextForServicesAtStartup<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
  ): Promise<void>;
}
