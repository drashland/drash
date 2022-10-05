"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainHandler = void 0;
class ChainHandler {
  /**
   * Each handler builds its own chain and passes that chain to this method to
   * run it. Each chain is made up of methods that should run in sequence in a
   * non-blocking style, hence using a reducer on thenables in this method.
   * @param context
   * @param chain
   * @returns
   */
  runMethodChain(context, chain) {
    // TODO(crookse) Why is this running twice
    if (!chain) {
      return;
    }
    console.log(`we are in the chain. chain is:`, chain);
    return chain.reduce((previousMethod, nextMethod) => {
      return previousMethod.then(() => nextMethod(context));
    }, Promise.resolve());
  }
}
exports.ChainHandler = ChainHandler;
//# sourceMappingURL=chain_handler.js.map
