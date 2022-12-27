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
import { AbstractChainHandler } from "./AbstractChainHandler.js";
import { ErrorHandlerProxy } from "../../proxies/ErrorHandlerProxy.js";
import { ServicesHandler } from "../services_handler.js";
import * as Interfaces from "../../interfaces.js";
import * as Types from "../../types.js";
/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of (not limited to) passing an incoming request through the lifecycle,
 * filtering requests, running middleware on requests, and returning a response
 * from the resource that matches the request.
 * @template GenericRequest The incoming request.
 * @template GenericResponse The outgoing response.
 */
export declare abstract class AbstractRequestHandler<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> extends AbstractChainHandler<GenericRequest, GenericResponseBuilder>
  implements
    Interfaces.RequestHandler<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    > {
  /**
   * See {@link ErrorHandlerProxy}.
   */
  protected error_handler: ErrorHandlerProxy<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  >;
  protected method_chain: Types.HandleMethod<
    Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
    void
  >[];
  /**
   * Key-value store where the key is the resource name and the value is the
   * resource proxy. This is populated at compile time and referenced only on
   * first requests to a resource. Subsequent requests will be forwarded to
   * reference `this.#resources_cached` for the resource.
   */
  protected resource_handlers: Record<
    string,
    Interfaces.ResourceHandler<GenericResponseBuilder>
  >;
  /**
   * Key-value store where the key is a request URL and the value is the
   * resource proxy that was matched to it.
   *
   * @see {@link Types.CachedResource} for cached resource schema.
   */
  protected resource_handlers_cached: Record<
    string,
    Interfaces.ResourceHandler<GenericResponseBuilder>
  >;
  protected services_handler: ServicesHandler<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  >;
  /**
   * @param options - See {@link Types.RequestHandlerOptions}.
   */
  constructor(
    options?: Types.RequestHandlerOptions<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
  );
  abstract createContext(
    incomingRequest: GenericRequest,
  ): Types.ContextForRequest<GenericRequest, GenericResponseBuilder>;
  addResources(
    resources: Types.ResourceClass<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >[],
  ): void;
  handle(incomingRequest: GenericRequest): Types.Promisable<GenericResponse>;
  /**
   * When creating an object of this class, there needs to be a way to run
   * services at startup time. This is why this method exists (so it can be
   * called when the request handler is instantiated in `mod.ts`).
   */
  runServicesAtStartup(): Promise<void>;
  abstract matchRequestToResourceHandler(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
  ): void;
  /**
   * Take the provided resource and construct it as a proxy. The proxy will be
   * in charge of running any services associated with the resource. This proxy
   * is what this class will use to run the resource.
   * @param ResourceClass - The resource class to instantiate and store in the
   * `resources` property.
   */
  abstract addResourceHandler(
    ResourceClass: Types.ResourceClass<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
  ): void;
  /**
   * Build this handler's chain.
   */
  protected buildMethodChain(): void;
  /**
   * In the event an error occurs in the chain, this method is called to handle
   * the context and further process a proper `Response` for the client.
   * @param context
   * @param error
   * @returns
   */
  protected runErrorHandler(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
    error: Error,
  ): Promise<void>;
}
