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

import * as Interfaces from "../../interfaces.ts";
import * as Types from "../../types.ts";

export abstract class ChainHandler<GenericRequest, GenericResponseBuilder>
  implements Interfaces.Handler<GenericResponseBuilder> {
  /**
   * Method to be implemented by all extended classes so they can be called by
   * other callers via `Interfaces.Handler`.
   * @param args - The handler's args.
   * @returns A `Promise` of the given `ReturnValue` or the `ReturnValue`.
   */
  abstract handle(
    ...args: unknown[]
  ): Types.Promisable<GenericResponseBuilder | void>;

  /**
   * Each handler builds its own chain and passes that chain to this method to
   * run it. Each chain is made up of methods that should run in sequence in a
   * non-blocking style, hence using a reducer on thenables in this method.
   * @param context
   * @param chain
   * @returns
   */
  protected runMethodChain(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
    chain: Types.HandleMethod<
      Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
      void
    >[],
  ): Types.Promisable<void> {
    // TODO(crookse) Why is this running twice
    if (!chain) {
      return;
    }

    return chain.reduce(
      (previousMethod, nextMethod) => {
        return previousMethod.then(() => nextMethod(context));
      },
      Promise.resolve(),
    );
  }
}
