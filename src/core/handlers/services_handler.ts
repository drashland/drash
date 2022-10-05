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

import { AbstractNativeRequest } from "../http/abstract/native_request.ts";
import * as Interfaces from "../interfaces.ts";
import * as Types from "../types.ts";

/**
 * Base class for services handlers.
 */
export class ServicesHandler<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> {
  #services: Record<
    Types.ServiceMethod,
    Interfaces.Service<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >[]
  > = {
    runAfterResource: [],
    runAtStartup: [],
    runBeforeResource: [],
    runOnError: [],
  };

  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////

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
  ) {
    this.#setServices(services ?? []);
  }

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * Does this service handler have methods of the given `method` defined?
   * @param method - See {@link Types.ServiceMethod}.
   * @returns True if yes, false if no.
   */
  public hasServices(method: Types.ServiceMethod): boolean {
    return !!this.#services[method].length;
  }

  /**
   * Run all services that have `runAfterResource` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  async runAfterResourceServices(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
  ): Promise<void> {
    const internalRequest =
      // @ts-ignore
      (context.request as unknown as AbstractNativeRequest);

    for (const service of this.#services.runAfterResource) {
      if (internalRequest.end_early) {
        return;
      }
      await service.runAfterResource!(context.request, context.response);
    }
  }

  /**
   * Run all services that have `runBeforeResource` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  async runBeforeResourceServices(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
  ): Promise<void> {
    const internalRequest =
      // @ts-ignore
      (context.request as unknown as AbstractNativeRequest);

    for (const service of this.#services.runBeforeResource) {
      if (internalRequest.end_early) {
        return;
      }
      await service.runBeforeResource!(context.request, context.response);
    }
  }

  /**
   * Run all services that have the `runOnError` method defined.
   * @param context
   */
  public async runOnErrorServices(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
  ): Promise<void> {
    for (const service of this.#services.runOnError) {
      await service.runOnError!(context.request, context.response);
    }
  }

  /**
   * Run all services that have `runAtStartup` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  public async runStartupServices(
    context: Types.ContextForServicesAtStartup<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
  ) {
    for (const service of this.#services.runAtStartup) {
      await service.runAtStartup!(context);
    }
  }

  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////

  /**
   * Set `this.#services` property -- categorizing services by the methods they
   * have defined.
   * @param services - All services this service handler handles.
   */
  #setServices(
    services: Interfaces.Service<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >[],
  ): void {
    const methods: Types.ServiceMethod[] = [
      "runAfterResource",
      "runAtStartup",
      "runBeforeResource",
      "runOnError",
    ];

    for (const method of methods) {
      for (const service of services) {
        if (method in service) {
          this.#services[method].push(service);
        }
      }
    }
  }
}
