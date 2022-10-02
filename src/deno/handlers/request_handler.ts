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

// Imports from /core/common
import { AbstractRequestHandler } from "../../core/handlers/abstract_request_handler.ts";
import { HttpError } from "../../core/http/errors.ts";
import { ResponseBuilder } from "../../core/http/response_builder.ts";
import { StatusCode } from "../../core/enums.ts";
import * as Types from "../../core/types.ts";

// Imports from /core/deno
import { DrashRequest } from "../http/drash_request.ts";
import { ResourceHandler } from "./resource_handler.ts";
import { Interfaces } from "../../../mod.deno.ts";

/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of (not limited to) passing an incoming request through the lifecycle,
 * filtering requests, running middleware on requests, and returning a response
 * from the resource that matches the request.
 */
export class RequestHandler
  extends AbstractRequestHandler<Interfaces.DrashRequest> {
  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////

  /**
   * Take the request in the given context and match its URL to a resource
   * handler. When matched, the `context.resource_handler` is set. If the
   * request's URL does not match with any resource handler (that is, the
   * request's URL does not match with any `paths` property in any resource),
   * then a `404 Not Found` error is thrown.
   * @param context - See {@link Types.ContextForRequest}.
   */
  matchRequestToResourceHandler(
    context: Types.ContextForRequest<Interfaces.DrashRequest>,
  ): void {
    const requestUrl = context.request.url;

    // If the resource was cached, then return it. No need to look for it again.
    if (this.resource_handlers_cached[requestUrl]) {
      const handler = this.resource_handlers_cached[requestUrl];
      context.resource_handler = handler;
      (context.request as DrashRequest).setResourceHandler(handler);
      return;
    }

    // Check all the resources to find the one that matches the request's URL
    for (const resourceConstructorName in this.resource_handlers) {
      const resourceHandler = this.resource_handlers[resourceConstructorName];
      const patterns = resourceHandler.getOriginalUrlPatterns() as URLPattern[];

      // Since all resources leverage `URLPattern`, we can check the request's
      // URL against it to find an exact match
      for (const pattern of patterns) {
        const result = pattern.exec(requestUrl);

        // No resource? Check the next one.
        if (result === null) {
          continue;
        }

        // Associate the request's URL with the resource that was just found so
        // subsequent requests can be faster
        const handler = this.resource_handlers[resourceConstructorName];
        this.resource_handlers_cached[requestUrl] = handler;
        (context.request as DrashRequest).setResourceHandler(handler);
        context.resource_handler = handler;
        return;
      }
    }

    throw new HttpError(StatusCode.NotFound);
  }

  /**
   * Each incoming request has its own context so as not to overlap with one
   * another. The context is created here.
   * @param incomingRequest - The request to create a context for before it is
   * processed through the chain.
   * @returns The context Drash needs to process the request end-to-end.
   */
  createContext(
    incomingRequest: Request,
  ): Types.ContextForRequest<Interfaces.DrashRequest> {
    const context: Types.ContextForRequest<Interfaces.DrashRequest> = {
      request: new DrashRequest(incomingRequest),
      response: new ResponseBuilder(),
    };

    return context;
  }

  addResourceHandler(
    ResourceClass: Types.ResourceClass<Interfaces.DrashRequest>,
  ): void {
    this.resource_handlers[ResourceClass.name] = new ResourceHandler(
      ResourceClass,
    );
  }
}
