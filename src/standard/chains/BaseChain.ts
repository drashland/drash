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

// Imports > Standard
import { AbstractChainBuilder } from "./AbstractChainBuilder.ts";
import type { Handler } from "../handlers/Handler.ts";

/**
 * The concrete builder behind {@link BaseChain}.
 *
 * {@link AbstractChainBuilder} leaves `build()` to the subclass and keeps
 * `link()` protected, so a chain assembled by hand needs a subclass that
 * exposes one. This is that subclass, and nothing more.
 *
 * Extend it when a chain needs methods of its own — see
 * `modules/builders/RequestChainBuilder.ts`, which adds `resources()` and
 * `urlPatternClass()` and decides the handler order itself.
 */
class BaseChainBuilder extends AbstractChainBuilder {
  /**
   * Wire the handlers added with `handler()` together.
   *
   * @returns The head of the chain. Send requests through it with `handle()`.
   */
  public override build(): Handler {
    return this.link();
  }
}

/**
 * A chain with no handlers of its own.
 *
 * Where the HTTP module's `Chain` decides its handlers and their order for
 * you, this one takes whatever you give it, in the order you give it. Reach for
 * it to compose a chain that is not the HTTP request chain.
 *
 * @example
 * ```ts
 * const chain = BaseChain
 *   .builder()
 *   .handler(new RequestValidator())
 *   .handler(new ResourceCaller())
 *   .build();
 *
 * await chain.handle<Response>(request);
 * ```
 */
class BaseChain {
  /**
   * @see {@link BaseChainBuilder} for the implementation.
   */
  static Builder = BaseChainBuilder;

  /**
   * Get a builder for assembling a chain by hand.
   *
   * @returns A builder with no handlers set.
   */
  static builder(): BaseChainBuilder {
    return new BaseChainBuilder();
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { BaseChain, BaseChainBuilder };
