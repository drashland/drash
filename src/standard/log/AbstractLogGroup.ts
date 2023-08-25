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
import { AbstractLogger } from "./AbstractLogger.ts";
import { Level } from "./Level.ts";
import type { LogGroup } from "./LogGroup.ts";

abstract class AbstractLogGroup extends AbstractLogger implements LogGroup {
  /**
   * @param name The name of this logger to be used as a prefix to log messages.
   * @param level (optional) The highest level this logger can log. Defaults to
   * {@link Level.Debug}.
   * @param options (optional) Options to control this logger's behavior.
   */
  constructor(
    name: string,
    level: Level = Level.Off,
  ) {
    super(name, level);
  }

  /**
   * Create a nested logger under this logger.
   * @param name The name of the nested logger.
   * @returns A `AbstractLogGroup` with a prefixed name. The prefix is this
   * `AbstractLogGroup`'s name.
   */
  abstract logger(name: string): LogGroup;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractLogGroup, type LogGroup };
