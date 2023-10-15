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
import { IHandler } from "../../core/interfaces/IHandler.ts";

/**
 * A class to be extended by handlers so they can share the same interface.
 */
class Handler implements IHandler {
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
  protected next: Handler | null = null;

  public handle<Output>(input: any): Promise<Output> {
    return this.sendToNextHandler(input);
  }

  public sendToNextHandler<Output>(input: any): Promise<Output> {
    if (this.next !== null) {
      return this.next.handle<Output>(input);
    }

    throw new Error(`Handler ${this.constructor.name} has no next handler`);
  }

  public setNext(handler: Handler): Handler {
    this.next = handler;
    return handler;
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { Handler };
