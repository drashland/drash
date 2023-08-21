/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
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

// Imports > Core
import { HTTPError } from "../../core/errors/HTTPError.ts";
import type { IBuilder } from "../../core/interfaces/IBuilder.ts";
import type { IResource } from "../../core/interfaces/IResource.ts";
import type { MethodOf } from "../../core/types/MethodOf.ts";
import type { ResourceClass } from "../../core/types/ResourceClass.ts";
import type { ILogger } from "../../core/interfaces/ILogger.ts";
import type { IHandler } from "../../core/interfaces/IHandler.ts";

// Imports > Standard
import {
  AbstractRequestHandler,
  type InputRequest,
} from "./AbstractRequestHandler.ts";
import { GroupConsoleLogger } from "../log/GroupConsoleLogger.ts";

type ResourceClassesArray = (ResourceClass | ResourceClass[])[];

type ResourceAndPathPatterns = {
  resource: IResource;
  path_patterns: any;
};

type ResourceWithPathParams = {
  resource: IResource | null;
  path_params: any;
};

type Builder = InstanceType<typeof AbstractBuilder>;

abstract class AbstractBuilder implements IBuilder {
  protected constructor_args: CtorParams = {
    resources: [],
  };

  public logger(logger: ILogger): this {
    this.constructor_args.logger = logger;
    return this;
  }

  public requestParamsParser(handler?: IHandler): this {
    this.constructor_args.request_params_parser = handler;
    return this;
  }

  public resources(...resources: ResourceClassesArray): this {
    this.constructor_args.resources = resources;
    return this;
  }

  abstract build<I extends InputRequest, O>(): AbstractResourceHandler<I, O>;
}

type CtorParams = {
  logger?: ILogger;
  request_params_parser?: IHandler;
  resources: ResourceClassesArray;
};

/**
 * Class responsible for:
 *
 * - Matching a request's URL to a resource's path
 * - Calling a resource's HTTP method based on the request's HTTP method
 * - Returning the result to the caller
 * - Throwing 404 errors if a request could not be matched to a resource
 */
abstract class AbstractResourceHandler<
  I extends InputRequest,
  O,
> extends AbstractRequestHandler<I, O> {
  static AbstractBuilder = AbstractBuilder;

  protected cached_resources: Record<string, any | null> = {};
  protected resource_path_patterns: ResourceAndPathPatterns[] = [];
  protected request_params_parser?: IHandler;

  #logger: ILogger = GroupConsoleLogger.create("ResourceHandler");

  constructor(options: CtorParams) {
    super();

    if (options.logger) {
      this.#logger = options.logger;
    }

    if (options.request_params_parser) {
      this.request_params_parser = options.request_params_parser;
    }
  }

  /**
   * Take the given `requestUrl` and match it to a resource caller.
   * @param requestUrl The URL (from the `Request` object) to use to match to a
   * resource caller.
   * @returns The resource caller.
   */
  public handle(request: I): Promise<O> {
    this.#logger.debug("Received request - typeof: {}", typeof request);

    let foundResource: ResourceWithPathParams;

    return Promise
      .resolve()
      .then(() => {
        foundResource = this.findFirstResourceByURL(request.url);
        if (!foundResource) {
          throw new HTTPError(404);
        }
      })
      .then(() => this.#parseRequestParams(request, foundResource.path_params))
      .then(() => this.#checkIfProxy(foundResource.resource!))
      .then(() =>
        this.#callResourceHTTPMethod(
          foundResource.resource!,
          request.method.toUpperCase() as MethodOf<IResource>,
          request,
        )
      );
  }

  /**
   * Add resources this class should handle.
   * @param resources The resource classes.
   */
  protected abstract addResources(_resources: ResourceClassesArray): void;

  /**
   * Find the first resource that matches the given `url`.
   * @param url The URL to match against the resource's `paths` values.
   */
  protected abstract findFirstResourceByURL(
    _url: string,
  ): ResourceWithPathParams;

  #parseRequestParams(request: I, pathParams: Record<string, string>): I {
    this.#logger.debug(`Calling request params parser`);
    if (this.request_params_parser) {
      return this.request_params_parser.handle(request, {
        path_params: pathParams,
      }) as I;
    }

    return request;
  }

  /**
   * Call the given `httpMethod` on the `resource` -- providing the given
   * `request` as the argument to it.
   * @param resource The resource containing the HTTP method.
   * @param httpMethod The HTTP method to call.
   * @param request The request to pass to the resource's HTTP method.
   * @returns The result from calling the resource's HTTP method.
   */
  #callResourceHTTPMethod(
    resource: IResource,
    httpMethod: MethodOf<IResource>,
    request: I,
  ): Promise<O> {
    this.#logger.trace(`Calling HTTP method: ${httpMethod}`);
    return Promise.resolve().then<O>(() => resource[httpMethod](request) as O);
  }

  /**
   * Check if the given `obj` is a proxy. This is used for debugging purposes.
   * @param obj The object in question.
   */
  #checkIfProxy(obj: IResource): void {
    if ("original_name" in obj) {
      this.#logger.trace(
        `Resource has a proxy: ${obj.original_name}`,
      );
    }
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export {
  type AbstractBuilder,
  AbstractResourceHandler,
  type Builder,
  type CtorParams,
  type InputRequest,
  type ResourceAndPathPatterns,
  type ResourceClassesArray,
  type ResourceWithPathParams,
};
