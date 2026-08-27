/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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
 * A logger that writes to the console inside a collapsible group, so related
 * messages stay together.
 *
 * @module
 */

// Imports > Standard
import { AbstractLogger } from "./AbstractLogger.ts";
import { Level } from "./Level.ts";
import type { LogLevel } from "./LogLevel.ts";

/**
 * Writes to the console inside a collapsible group, so related messages stay
 * together. Child loggers created with {@link logger} nest under their parent's
 * name.
 */
class GroupConsoleLogger extends AbstractLogger {
  #loggers: Record<string, GroupConsoleLogger> = {};

  /**
   * Create this logger.
   * @param name
   * @param level The highest log message level this logger can write.
   * @returns
   */
  static create(name: string, level: LogLevel = Level.Off): GroupConsoleLogger {
    return new GroupConsoleLogger(name, level);
  }

  /**
   * Get a child logger nested under this one, creating it on first use.
   *
   * The child inherits this logger's level and prefixes its name with this
   * logger's own.
   *
   * @param name The child's name.
   * @returns The child logger, the same instance on every call.
   */
  public logger(name: string): GroupConsoleLogger {
    if (!this.#loggers[name]) {
      this.#loggers[name] = new GroupConsoleLogger(
        `${this.name}:${name}`,
        this.level,
      );
    }

    return this.#loggers[name];
  }

  /**
   * Write the formatted message to the console inside this logger's group.
   *
   * @param messages The level, message, and replacements.
   */
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
