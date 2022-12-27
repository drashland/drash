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

import * as Interfaces from "../Interfaces.ts";
import * as Types from "../Types.ts";

export class ChainOfResponsibilityHandler implements Interfaces.RequestHandler {
  protected next_handler?: Interfaces.RequestHandler;

  /**
   * Method to be implemented by all extended classes so they can be called by
   * other callers via `Interfaces.Handler`.
   * @param args - The handler's args.
   * @returns A `Promise` of the given `ReturnValue` or the `ReturnValue`.
   */
  public handle(
    context: Types.ContextForRequest,
  ): Types.Promisable<Types.ContextForRequest> {
    // If there is no next handler, then we can return the context back to the
    // caller that first called `handler.handle()`. This first caller will be in
    // charge of processing the results built from the chain.
    if (!this.next_handler) {
      return context;
    }

    return this.next_handler.handle(context);
  }

  public setNextHandler(
    handler: Interfaces.RequestHandler,
  ): Interfaces.RequestHandler {
    this.next_handler = handler;
    return handler;
  }
}
