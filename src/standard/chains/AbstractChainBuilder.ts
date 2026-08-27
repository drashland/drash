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

/**
 * The base for chain builders. Collects handlers, then links them into a chain
 * and returns its head.
 *
 * @module
 */

// Imports > Core
import type { IBuilder } from "../../core/interfaces/IBuilder.ts";

// Imports > Standard
import type { Handler } from "../handlers/Handler.ts";

/**
 * The base for chain builders. Collects handlers, then links them into a chain.
 */
abstract class AbstractChainBuilder implements IBuilder {
  /**
   * The handlers collected so far, in the order they will run.
   */
  readonly handlers: Handler[] = [];

  /**
   * Link the collected handlers and return the head of the chain.
   *
   * @returns The first handler, which is what a request is handed to.
   */
  abstract build(): unknown;

  /**
   * Add a handler to the end of the chain.
   *
   * @param handler The handler to add.
   * @returns This builder, for chaining.
   */
  public handler(handler: Handler): this {
    this.handlers.push(handler);

    return this;
  }

  /**
   * Link every collected handler to the one after it.
   *
   * @param handlers The handlers that will be chained together.
   * @returns This instance so you can chain more methods.
   */
  protected link(): Handler {
    if (!this.handlers) {
      throw new Error("Chain.Builder: `this.handlers` should be an array");
    }

    if (!this.handlers.length) {
      throw new Error("Chain.Builder: `this.handlers` is empty");
    }

    this.handlers.reduce((previous, current) => {
      return previous.setNext(current);
    });

    return this.handlers[0];
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractChainBuilder };
