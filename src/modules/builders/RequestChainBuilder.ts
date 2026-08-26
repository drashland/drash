/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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
import type { Resource } from "../../core/http/Resource.ts";

// Imports > Standard
import { AbstractChainBuilder } from "../../standard/chains/AbstractChainBuilder.ts";
import type { Handler } from "../../standard/handlers/Handler.ts";
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
 * The public surface of the request chain builder.
 *
 * This is what {@link requestChain} hands back. It deliberately omits the
 * `handler()` and `handlers` members inherited from `AbstractChainBuilder`: the
 * request chain's handlers, and the order they run in, are decided by
 * {@link Builder.build} and are not the consumer's to change.
 *
 * The chaining methods return `Builder` rather than `this` on purpose. `this` would
 * resolve back to the implementing class and put the hidden members back within
 * reach on every call after the first.
 *
 * Exported because {@link requestChain} is annotated with it. Without a named,
 * exported return type, declaration emit has to describe the unexported
 * implementation class structurally and fails on its private members (TS4094).
 */
export interface Builder {
  /**
   * Add resources to this chain.
   * @param resources The resource classes this chain should route requests to.
   * @returns This instance for method chaining.
   */
  resources(...resources: ResourceClasses[]): Builder;

  /**
   * Set the `URLPattern`-like class used to match requests to resources.
   *
   * Required — {@link Builder.build} throws without it. Runtimes with a native
   * `URLPattern` pass that; the rest pass a polyfill.
   *
   * @param urlPatternClass The `URLPattern`-like class to match request URLs with.
   * @returns This instance for method chaining.
   */
  urlPatternClass(urlPatternClass: URLPatternClass): Builder;

  /**
   * Wire the handlers together.
   * @returns The head of the chain. Send requests through it with `.handle()`.
   */
  build(): Handler;
}

/**
 * Builder for building a chain of handlers.
 *
 * Not exported. Consumers receive it as {@link Builder}, the narrower type above.
 */
class RequestChainBuilder extends AbstractChainBuilder implements Builder {
  #resources: ResourceClasses[] = [];
  #URLPatternClass?: URLPatternClass;

  public build() {
    if (!this.#URLPatternClass) {
      throw new Error(
        `\`this.urlPatternClass(Resource)\` not called. Cannot create RequestChain without a \`URLPattern\`-like class.`,
      );
    }

    const firstHandler = new RequestValidator();

    this
      .handler(firstHandler)
      .handler(new ResourcesIndex(this.#URLPatternClass, ...this.#resources))
      .handler(new ResourceNotFoundHandler())
      .handler(new RequestParamsParser())
      .handler(new ResourceCaller())
      .link();

    return firstHandler;
  }

  /** See {@link Builder.resources}. */
  public resources(...resources: ResourceClasses[]) {
    this.#resources = resources;
    return this;
  }

  /** See {@link Builder.urlPatternClass}. */
  public urlPatternClass(urlPatternClass: URLPatternClass): this {
    this.#URLPatternClass = urlPatternClass;
    return this;
  }
}

/**
 * Get an HTTP request chain builder.
 *
 * @returns An HTTP request chain builder.
 *
 * @see {@link RequestChainBuilder} for implementation details.
 */
export function requestChain(): Builder {
  return new RequestChainBuilder();
}
