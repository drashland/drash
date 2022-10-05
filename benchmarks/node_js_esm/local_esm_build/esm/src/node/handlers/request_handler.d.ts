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
import { AbstractRequestHandler } from "../../core/handlers/abstract/request_handler.js";
import * as CoreTypes from "../../core/types.js";
import * as Interfaces from "../../core/interfaces.js";
/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of (not limited to) passing an incoming request through the lifecycle,
 * filtering requests, running middleware on requests, and returning a response
 * from the resource that matches the request.
 */
export declare class RequestHandler
  extends AbstractRequestHandler<unknown, unknown, unknown, any> {
  /**
   * Take the request in the given context and match its URL to a resource
   * handler. When matched, the `context.resource_handler` is set. If the
   * request's URL does not match with any resource handler (that is, the
   * request's URL does not match with any `paths` property in any resource),
   * then a `404 Not Found` error is thrown.
   * @param context - See {@link CoreTypes.ContextForRequest}.
   */
  matchRequestToResourceHandler(
    context: CoreTypes.ContextForRequest<unknown, unknown>,
  ): void;
  handle(
    incomingRequest: unknown,
    response: Interfaces.ResponseBuilder<unknown, unknown>,
  ): CoreTypes.Promisable<unknown>;
  /**
   * Each incoming request has its own context so as not to overlap with one
   * another. The context is created here.
   * @param incomingRequest - The request to create a context for before it is
   * processed through the chain.
   * @returns The context Drash needs to process the request end-to-end.
   */
  createContext(
    incomingRequest: unknown,
    response: unknown,
  ): CoreTypes.ContextForRequest<unknown, Interfaces.ResponseBuilder<any, any>>;
  addResourceHandler(
    ResourceClass: CoreTypes.ResourceClass<unknown, unknown, unknown, any>,
  ): void;
}
