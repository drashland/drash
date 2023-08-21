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

/**
 * A base interface for handler classes.
 */
export interface IHandler<I = unknown, O = unknown> {
  /**
   * Handle the given input to produce an output. For example, handle a request
   * (the input) to produce a response (the output).
   * @param input The input in question.
   * @return The output.
   */
  handle(input: I, ...rest: unknown[]): O;

  /**
   * Set this handler's next handler.
   * @param nextHandler
   * @returns The next handler.
   */
  setNext(handler: IHandler): IHandler;
}
