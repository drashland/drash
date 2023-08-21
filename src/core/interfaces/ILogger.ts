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
 * Base interface for logger classes.
 */
export interface ILogger {
  /**
   * Write `debug` messages.
   * @param messages The messages to write.
   */
  debug(...messages: unknown[]): unknown;
  /**
   * Write `error` messages.
   * @param messages The messages to write.
   */
  error(...messages: unknown[]): unknown;
  /**
   * Write `fatal` messages.
   * @param messages The messages to write.
   */
  fatal(...messages: unknown[]): unknown;
  /**
   * Write `info` messages.
   * @param messages The messages to write.
   */
  info(...messages: unknown[]): unknown;
  /**
   * Write `trace` messages.
   * @param messages The messages to write.
   */
  trace(...messages: unknown[]): unknown;
  /**
   * Write `warn` messages.
   * @param messages The messages to write.
   */
  warn(...messages: unknown[]): unknown;
}
