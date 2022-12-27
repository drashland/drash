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

import { ResponseBuilder } from "../../builders/ResponseBuilder.ts";
import { DrashRequest } from "../HTTP/DrashRequest.ts";
import { HTTPError } from "../Errors/HTTPError.ts";
import { ErrorHandlerProxy } from "../Proxies/ErrorHandlerProxy.ts";
import { ResourceHandler } from "../Handlers/ResourceHandler.ts";
import { ServicesHandler } from "../Handlers/ServicesHandler.ts";
import { ErrorHandler } from "../Handlers/ErrorHandler.ts";
import * as Types from "../../core/Types.ts";
import * as Interfaces from "../../core/Interfaces.ts";
import * as Enums from "../../core/Enums.ts";
import { StatusCodeRegistry } from "../http/StatusCodeRegistry.ts";
import { RequestHandler } from "../handlers/RequestHandler.ts";
import { createRequestChainOfResponsibility } from "../factories/ChainOfResponsibilityFactory.ts";
import { ChainOfResponsibilityHandler } from "../Handlers/ChainOfResponsibilityHandler.ts";

/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of (not limited to) passing an incoming request through the lifecycle,
 * filtering requests, running middleware on requests, and returning a response
 * from the resource that matches the request.
 */
export class RequestHandlerBuilder {
  // /**
  //  * See {@link ErrorHandlerProxy}.
  //  */
  // protected error_handler: ErrorHandlerProxy;

  // /**
  //  * A chain of `handle()` methods that this class calls.
  //  */
  // protected chain: Types.HandleMethod<
  //   Types.ContextForRequest,
  //   void
  // >[] = [];

  /**
   * Key-value store where the key is the resource name and the value is the
   * resource proxy. This is populated at compile time and referenced only on
   * first requests to a resource. Subsequent requests will be forwarded to
   * reference `this.#resources_cached` for the resource.
   */
  protected resource_handlers: Interfaces.RequestHandler[] = [];
  // /**
  //  * Key-value store where the key is a request URL and the value is the
  //  * resource proxy that was matched to it.
  //  *
  //  * @see {@link Types.CachedResource} for cached resource schema.
  //  */
  // protected resource_handlers_cached: Record<
  //   string,
  //   Interfaces.ResourceHandler
  // > = {};

  // protected services_handler: ServicesHandler;

  /**
   * @param options - See {@link Types.RequestHandlerOptions}.
   */
  constructor(
    options?: Types.RequestHandlerOptions,
  ) {
    // this.services_handler = new ServicesHandler(options?.services ?? []);
    // this.error_handler = new ErrorHandlerProxy(
    //   options?.error_handler ?? ErrorHandler,
    // );
    this.addResources(options?.resources ?? []);
  }

  protected addResourceHandler(
    ResourceClass: Types.ResourceClass,
  ): void {
    console.log("addResourceHandler: begin");
    this.resource_handlers.push(
      new ResourceHandler(
        ResourceClass,
      ),
    );
    console.log("addResourceHandler: end");
  }

  /**
   * Take the request in the given context and match its URL to a resource
   * handler. When matched, the `context.resource_handler` is set. If the
   * request's URL does not match with any resource handler (that is, the
   * request's URL does not match with any `paths` property in any resource),
   * then a `404 Not Found` error is thrown.
   * @param context - See {@link Types.ContextForRequest}.
   */
  // protected matchRequestToResourceHandler(
  //   context: Types.ContextForRequest,
  // ): void {
  //   const requestUrl = context.request.url;

  //   // If the resource was cached, then return it. No need to look for it again.
  //   if (this.resource_handlers_cached[requestUrl]) {
  //     const handler = this.resource_handlers_cached[requestUrl];
  //     context.resource_handler = handler;
  //     (context.request as DrashRequest).setResourceHandler(handler);
  //     return;
  //   }

  //   // Check all the resources to find the one that matches the request's URL
  //   for (const resourceConstructorName in this.resource_handlers) {
  //     const resourceHandler = this.resource_handlers[resourceConstructorName];
  //     const patterns = resourceHandler.getOriginalUrlPatterns() as URLPattern[];

  //     // Since all resources leverage `URLPattern`, we can check the request's
  //     // URL against it to find an exact match
  //     for (const pattern of patterns) {
  //       const result = pattern.exec(requestUrl);

  //       // No resource? Check the next one.
  //       if (result === null) {
  //         continue;
  //       }

  //       // Associate the request's URL with the resource that was just found so
  //       // subsequent requests can be faster
  //       const handler = this.resource_handlers[resourceConstructorName];
  //       this.resource_handlers_cached[requestUrl] = handler;
  //       (context.request as DrashRequest).setResourceHandler(handler);
  //       context.resource_handler = handler;
  //       return;
  //     }
  //   }

  //   throw new HTTPError(Enums.HTTPStatusCode.NotFound);
  // }

  public async runServicesAtStartup(): Promise<void> {
    await Promise.resolve();
  }

  public async build(): Promise<{
    handleRequest: (request: Request) => Promise<Response>;
  }> {
    console.log("building");
    await this.runServicesAtStartup();

    const firstHandler = new FirstHandler();

    createRequestChainOfResponsibility([
      firstHandler,
      new RequestHandler(),
    ]);

    return firstHandler;
  }

  /**
   * Build this handler's chain.
   */
  // protected buildMethodChain(): void {
  //   // Run all "global before resource" services
  //   if (this.services_handler.hasServices("runBeforeResource")) {
  //     this.chain.push(
  //       (
  //         context: Types.ContextForRequest,
  //       ) => {
  //         return this.services_handler.runBeforeResourceServices(context);
  //       },
  //     );
  //   }

  //   // Run the resource handler
  //   this.chain.push(
  //     (
  //       context: Types.ContextForRequest,
  //     ) => {
  //       if ((context.request as DrashRequest).end_early) {
  //         return;
  //       }

  //       return context.resource_handler?.handle(context);
  //     },
  //   );

  //   // Run all "global after resource" services
  //   if (this.services_handler.hasServices("runAfterResource")) {
  //     this.chain.push(
  //       (
  //         context: Types.ContextForRequest,
  //       ) => {
  //         return this.services_handler.runAfterResourceServices(context);
  //       },
  //     );
  //   }
  // }

  public addResources(
    resources: Types.ResourceClass[],
  ): void {
    resources.forEach(
      (
        resourceClass: Types.ResourceClass,
      ) => {
        this.addResourceHandler(resourceClass);
      },
    );
  }
}

class FirstHandler extends ChainOfResponsibilityHandler {
  handleRequest(incomingRequest: Request): Promise<Response> {
    console.log("FirstHandler.handleRequest()");
    const context = this.createContext(incomingRequest);
    return Promise.resolve(this.next_handler?.handle(context))
      .then((context) => {
        console.log(`then(context)`);
        return (context?.response as ResponseBuilder).build();
      });
  }

  createContext(incomingRequest: Request): Types.ContextForRequest {
    return {
      request: new DrashRequest(incomingRequest),
      response: new ResponseBuilder(),
    };
  }
}
