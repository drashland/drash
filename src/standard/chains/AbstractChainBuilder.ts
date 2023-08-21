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
import { IBuilder } from "../../core/interfaces/IBuilder.ts";
import { IHandler } from "../../core/interfaces/IHandler.ts";

abstract class AbstractChainBuilder implements IBuilder {
  /**
   * The first handler in the chain.
   */
  protected first_handler?: IHandler;

  /**
   * @param handlers The handlers that will be chained together.
   * @returns This instance (for convenient method chaining).
   */
  public handlers(...handlers: IHandler[]): this {
    if (!handlers || !handlers.length) {
      throw new Error("Chain.Builder: `handlers` arg must be an array");
    }

    const firstHandler = handlers[0];

    handlers.reduce((previous, current) => {
      return previous.setNext(current);
    });

    this.first_handler = firstHandler;

    return this;
  }

  abstract build(): unknown;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractChainBuilder };
