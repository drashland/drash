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

// Imports > Standard
import { Level } from "./Level.ts";
import { AbstractLogGroup } from "./AbstractLogGroup.ts";

class GroupConsoleLogger extends AbstractLogGroup {
  #loggers: Record<string, GroupConsoleLogger> = {};

  /**
   * Create this logger.
   * @param name
   * @param level The highest log message level this logger can write.
   * @returns
   */
  static create(name: string, level: Level = Level.Off): GroupConsoleLogger {
    return new GroupConsoleLogger(name, level);
  }

  public logger(name: string): GroupConsoleLogger {
    if (!this.#loggers[name]) {
      this.#loggers[name] = new GroupConsoleLogger(
        `${this.name}:${name}`,
        this.level,
      );
    }

    return this.#loggers[name];
  }

  protected write(
    level: string,
    message: string,
    replacements: unknown[],
  ): void {
    console.log(this.getFormattedMessage(level, message, replacements));
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { GroupConsoleLogger, Level };
