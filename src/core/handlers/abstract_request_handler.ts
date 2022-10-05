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

import { ChainHandler } from "./chain_handler.ts";
import { ResponseBuilder } from "../http/response_builder.ts";
import { ErrorHandler } from "./error_handler.ts";
import { ErrorHandlerProxy } from "../proxies/error_handler_proxy.ts";
import { HttpError } from "../http/errors.ts";
import { ServicesHandler } from "./services_handler.ts";
import * as Enums from "../enums.ts";
import * as Interfaces from "../interfaces.ts";
import { AbstractRequest } from "../http/abstract_native_request.ts";
import * as Types from "../types.ts";

/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of (not limited to) passing an incoming request through the lifecycle,
 * filtering requests, running middleware on requests, and returning a response
 * from the resource that matches the request.
 */
export abstract class AbstractRequestHandler<RequestType>
  extends ChainHandler<RequestType>
  implements Interfaces.RequestHandler<RequestType> {
  /**
   * See {@link ErrorHandlerProxy}.
   */
  protected error_handler: ErrorHandlerProxy<RequestType>;
  protected method_chain: Types.HandleMethod<
    Types.ContextForRequest<RequestType>,
    void
  >[] = [];
  /**
   * Key-value store where the key is the resource name and the value is the
   * resource proxy. This is populated at compile time and referenced only on
   * first requests to a resource. Subsequent requests will be forwarded to
   * reference `this.#resources_cached` for the resource.
   */
  protected resource_handlers: Record<string, Interfaces.ResourceHandler> = {};
  /**
   * Key-value store where the key is a request URL and the value is the
   * resource proxy that was matched to it.
   *
   * @see {@link Types.CachedResource} for cached resource schema.
   */
  protected resource_handlers_cached: Record<
    string,
    Interfaces.ResourceHandler
  > = {};
  protected services_handler: ServicesHandler<RequestType>;

  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////

  /**
   * @param options - See {@link Types.RequestHandlerOptions}.
   */
  constructor(options?: Types.RequestHandlerOptions<RequestType>) {
    super();
    this.services_handler = new ServicesHandler(options?.services ?? []);
    this.error_handler = new ErrorHandlerProxy(
      options?.error_handler ?? ErrorHandler,
    );
    this.addResources(options?.resources ?? []);
    this.buildMethodChain();
  }

  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////

  abstract createContext(
    incomingRequest: RequestType,
  ): Types.ContextForRequest<RequestType>;

  public addResources(resources: Types.ResourceClass<RequestType>[]): void {
    resources.forEach((resourceClass: Types.ResourceClass<RequestType>) => {
      this.addResourceHandler(resourceClass);
    });
  }

  public handle(incomingRequest: RequestType): Types.Promisable<Response> {
    const context = this.createContext(incomingRequest);

    return Promise
      .resolve()
      .then(() => this.matchRequestToResourceHandler(context))
      .then(() => super.runMethodChain(context, this.method_chain))
      .then(() => (context: Types.ContextForRequest<RequestType>) => {
        return context.resource_handler?.handle(context);
      })
      .catch((e: Error) => this.runErrorHandler(context, e))
      .then(() => (context.response as ResponseBuilder).build());
  }

  // FILE MARKER - METHODS - PUBLIC (HIDDEN) ///////////////////////////////////

  /**
   * When creating an object of this class, there needs to be a way to run
   * services at startup time. This is why this method exists (so it can be
   * called when the request handler is instantiated in `mod.ts`).
   */
  public async runServicesAtStartup(): Promise<void> {
    if (this.services_handler.hasServices("runAtStartup")) {
      await this.services_handler.runStartupServices({
        request_handler: this,
      });
    }
  }

  abstract matchRequestToResourceHandler(
    context: Types.ContextForRequest<RequestType>,
  ): void;

  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////

  /**
   * Take the provided resource and construct it as a proxy. The proxy will be
   * in charge of running any services associated with the resource. This proxy
   * is what this class will use to run the resource.
   * @param ResourceClass - The resource class to instantiate and store in the
   * `resources` property.
   */
  abstract addResourceHandler(
    ResourceClass: Types.ResourceClass<RequestType>,
  ): void;

  /**
   * Build this handler's chain.
   */
  protected buildMethodChain(): void {
    console.log("Building method chain");
    // Run all "global before resource" services
    if (this.services_handler.hasServices("runBeforeResource")) {
      this.method_chain.push(
        (context: Types.ContextForRequest<RequestType>) => {
          return this.services_handler.runBeforeResourceServices(context);
        },
      );
    }

    // Run the resource handler
    this.method_chain.push((context: Types.ContextForRequest<RequestType>) => {
      if ((context.request as AbstractRequest).end_early) {
        return;
      }

      return context.resource_handler?.handle(context);
    });

    // Run all "global after resource" services
    if (this.services_handler.hasServices("runAfterResource")) {
      this.method_chain.push(
        (context: Types.ContextForRequest<RequestType>) => {
          return this.services_handler.runAfterResourceServices(context);
        },
      );
    }
  }

  /**
   * In the event an error occurs in the chain, this method is called to handle
   * the context and further process a proper `Response` for the client.
   * @param context
   * @param error
   * @returns
   */
  protected runErrorHandler(
    context: Types.ContextForRequest<RequestType>,
    error: Error,
  ): Promise<void> {
    context.error = error ?? new HttpError(
      Enums.StatusCode.InternalServerError,
    );

    console.log(`WEEEE:`, error);

    return Promise
      .resolve()
      .then(() =>
        this.error_handler.handle({
          error: context.error,
          response: context.response,
          request: context.request,
        })
      )
      .then(() => {
        if (this.services_handler.hasServices("runOnError")) {
          return this.services_handler.runOnErrorServices(
            context,
          );
        }
      });
  }
}
