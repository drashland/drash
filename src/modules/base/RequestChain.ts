/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
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
import { Resource } from "../../core/http/Resource.ts";
import type { IHandler } from "../../core/interfaces/IHandler.ts";

// Imports > Standard
import { AbstractChainBuilder } from "../../standard/chains/AbstractChainBuilder.ts";
import { RequestParamsParser } from "../../standard/handlers/RequestParamsParser.ts";
import { RequestValidator } from "../../standard/handlers/RequestValidator.ts";
import { ResourceCaller } from "../../standard/handlers/ResourceCaller.ts";
import { ResourceNotFoundHandler } from "../../standard/handlers/ResourceNotFoundHandler.ts";
import {
  ResourcesIndex,
  type URLPatternClass,
} from "../../standard/handlers/ResourcesIndex.ts";

type ResourceClasses = typeof Resource | typeof Resource[];

/**
 * Builder for building a chain of handlers.
 */
class Builder extends AbstractChainBuilder {
  #resources: ResourceClasses[] = [];
  #URLPatternClass?: URLPatternClass;

  /**
   * Add resources to this chain.
   * @param resources
   * @returns This instance for method chaining.
   */
  resources(...resources: ResourceClasses[]) {
    this.#resources = resources;
    return this;
  }

  /**
   * Set the handler that matches requests to resources.
   * @param handler
   * @returns
   */
  urlPatternClass(urlPatternClass: URLPatternClass): this {
    this.#URLPatternClass = urlPatternClass;
    return this;
  }

  public build<I, O>(): IHandler<I, Promise<O>> {
    if (!this.#URLPatternClass) {
      throw new Error(
        `\`this.urlPatternClass(Resource)\` not called. Cannot create RequestChain without a \`URLPattern\`-like class.`,
      );
    }

    this
      .handler(new RequestValidator())
      .handler(new ResourcesIndex(this.#URLPatternClass, ...this.#resources))
      .handler(new ResourceNotFoundHandler())
      .handler(new RequestParamsParser())
      .handler(new ResourceCaller())
      .link();

    return this.first_handler as IHandler<I, Promise<O>>;
  }
}

class RequestChain {
  static builder(): Builder {
    return new Builder();
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Builder, RequestChain };
