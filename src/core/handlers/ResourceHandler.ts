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

import { DrashRequest } from "../HTTP/DrashRequest.ts";
import { ChainOfResponsibilityHandler } from "./ChainOfResponsibilityHandler.ts";
import { HTTPMethod } from "../Enums.ts";
import { ServicesHandler } from "./ServicesHandler.ts";
import * as Interfaces from "../Interfaces.ts";
import * as Types from "../Types.ts";

/**
 * Class that handles requests that have made it to an existing resource. This
 * class ensures requests run through the chains defined by the `Resource` (see
 * `this#original`). Resource's can have multiple chains -- one for each HTTP
 * method they define; and each of those chains can have services.
 */
export class ResourceHandler extends ChainOfResponsibilityHandler
  implements Interfaces.RequestHandler {
  protected original: Interfaces.Resource;
  protected method_chains: Record<
    HTTPMethod,
    Types.HandleMethod<
      Types.ContextForRequest,
      void
    >[]
  > = {
    CONNECT: [],
    DELETE: [],
    GET: [],
    HEAD: [],
    OPTIONS: [],
    PATCH: [],
    POST: [],
    PUT: [],
    TRACE: [],
  };
  protected services_all_handler: ServicesHandler;

  readonly original_url_patterns: URLPattern[];

  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////

  /**
   * @param ResourceClass - See {@link Resource}.
   */
  constructor(
    ResourceClass: Types.ResourceClass,
  ) {
    super();
    this.original = new ResourceClass();

    this.services_all_handler = new ServicesHandler(
      this.original.services.ALL ?? [],
    );

    this.original_url_patterns = this.getOriginalUrlPatterns();

    this.#buildMethodChains();
  }

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * Take `this.#original.paths` and convert them to `URLPattern` objects.
   * @returns An array of `URLPattern` objects created from
   * `this.#original.paths`.
   */
  protected getOriginalUrlPatterns(): URLPattern[] {
    const patterns: URLPattern[] = [];

    this.original.paths.forEach(
      (path: string) => {
        // Add "{/}?" to match possible trailing slashes too. For example, this
        // means the following paths point to the same resource:
        //
        //   - /coffee
        //   - /coffee/
        //
        patterns.push(new URLPattern({ pathname: path + "{/}?" }));
      },
    );

    return patterns;
  }

  public handle(
    context: Types.ContextForRequest,
  ): Types.Promisable<Types.ContextForRequest> {
    if ((context.request as DrashRequest).end_early) {
      return context;
    }

    // @ts-ignore: TODO(crookse): Need to make sure we have a Request interface
    const httpMethod = context.request.method as HTTPMethod;
    return super.runMethodChain(context, this.method_chains[httpMethod]);
  }

  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////

  /**
   * Each HTTP method is isolated to its own chain of events. This makes HTTP
   * methods only run the methods it needs to -- making them efficient by
   * preventing them from doing checks to see if they need to run services.
   */
  #buildMethodChains(): void {
    for (const httpMethod of Object.values(HTTPMethod)) {
      // Add the "ALL" services that run before the HTTP method
      if (this.services_all_handler.hasServices("runBeforeResource")) {
        this.method_chains[httpMethod].push(
          this.services_all_handler.runBeforeResourceServices.bind(
            this.services_all_handler,
          ),
        );
      }

      // Create the HTTP method's service handler. Each HTTP method has its own
      // service handler because a resource can define HTTP method level
      // services.
      const services = new ServicesHandler(
        this.original.services[httpMethod] ?? [],
      );

      // Add the services that run before the HTTP method
      if (services.hasServices("runBeforeResource")) {
        this.method_chains[httpMethod].push((
          context: Types.ContextForRequest,
        ) => services.runBeforeResourceServices(context));
      }

      // Add the HTTP method
      this.method_chains[httpMethod].push(
        (
          context: Types.ContextForRequest,
        ) => {
          if ((context.request as DrashRequest).end_early) {
            return;
          }

          const resourceHttpMethod = this.original[httpMethod];

          if (!resourceHttpMethod) {
            return;
          }

          return Promise
            .resolve((() => {
              // logger.debug("Running resource HTTP method");
              const res = resourceHttpMethod.bind(this.original)(
                context.request,
              );
              // logger.debug("Got response:");
              // logger.debug(res);
              context.response = res;
            })())
            .then(() => {
              if ((context.request as DrashRequest).end_early) {
                return;
              }
            });
        },
      );

      // Add the services that run after the HTTP method
      if (services.hasServices("runAfterResource")) {
        this.method_chains[httpMethod].push(
          services.runAfterResourceServices.bind(services),
        );
      }

      // Add the "ALL" services that run before the HTTP method
      if (this.services_all_handler.hasServices("runAfterResource")) {
        this.method_chains[httpMethod].push(
          this.services_all_handler.runAfterResourceServices.bind(
            this.services_all_handler,
          ),
        );
      }
    }
  }
}
