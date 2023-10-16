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

// Imports > Standard
import { AbstractChainBuilder } from "../../standard/chains/AbstractChainBuilder.ts";

/**
 * Builder for building a chain of handlers.
 */
class Builder extends AbstractChainBuilder {
  /**
   * Chain all handlers together.
   * @returns The first handler.
   */
  public build() {
    const firstHandler = this.link();

    if (!firstHandler) {
      throw new Error(
        "Chain.Builder: No handlers set. Did you forget to call `this.handlers()`?",
      );
    }

    return firstHandler;
  }
}

class Chain {
  /**
   * @see {@link Builder} for implementation.
   */
  static Builder = Builder;

  /**
   * Get the builder for building a chain of handlers.
   * @returns An instance of the builder.
   */
  static builder(): Builder {
    return new Builder();
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Builder, Chain };
