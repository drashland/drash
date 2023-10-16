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

/**
 * A utility type that lets the compiler and reader know: the member
 * assigned this type is a method of the given generic `Object`.
 *
 * @example
 * ```ts
 * class One {
 *   a() {}
 *   b() {}
 *   c() {}
 * }
 *
 * const methods = ["a", "b", "c"];
 *
 * const one = new One();
 *
 * one[methods[0]]();
 * // Element implicitly has an 'any' type because expression of type 'string'
 * // can't be used to index type 'One'.(7053)
 *
 * one[methods[0] as MethodOf<One>]();
 * // OK
 * ```
 */
export type MethodOf<Object> = {
  [K in keyof Object]: Object[K] extends Func ? K
    : never;
}[keyof Object];

type Func =
  | ((...args: unknown[]) => unknown)
  | (() => unknown);