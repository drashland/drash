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

import { IHandler } from "../../core/interfaces/IHandler.ts";
/**
 * A class to be extended by handlers so they can share the same interface.
 */
export class Handler<O = unknown> implements IHandler<O> {
  /**
   * Handlers can be chained together using this property. See example.
   *
   * @example
   * ```
   * // Instantiate some handlers
   * const handlerA = new HandlerA();
   * const handlerB = new HandlerB();
   * const handlerC = new HandlerC();
   *
   * // Link them together
   * handlerA.setNext(handlerB).setNext(handlerC);
   * ```
   */
  next_handler?: IHandler<O>;

  handle(input: unknown): O {
    if (this.next_handler) {
      return this.next_handler.handle(input);
    }

    throw new Error("Input could not be processed further");
  }

  public setNext(nextHandler: IHandler<O>): IHandler<O> {
    this.next_handler = nextHandler;
    return this.next_handler;
  }
}
