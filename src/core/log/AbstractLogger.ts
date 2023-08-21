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

import { ILogger } from "../interfaces/ILogger.ts";
import { Level } from "./Level.ts";

enum LevelDisplayName {
  Off = "OFF",
  Fatal = "FATAL",
  Error = "ERROR",
  Warn = "WARN ",
  Info = "INFO ",
  Debug = "DEBUG",
  Trace = "TRACE",
  All = "ALL",
}

/**
 * Base logger for logger classes.
 */
export abstract class AbstractLogger implements ILogger {
  /**
   * The name of this logger. Can be used when writing messsages.
   */
  protected name: string;

  /**
   * The highest level log message this logger can write.
   */
  protected level: Level;

  constructor(name: string, level: Level) {
    this.name = name;
    this.level = level;
  }

  public debug(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Debug)) {
      return;
    }
    return this.write(LevelDisplayName.Debug, message, replacements);
  }

  public error(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Error)) {
      return;
    }
    return this.write(LevelDisplayName.Error, message, replacements);
  }

  public fatal(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Fatal)) {
      return;
    }
    return this.write(LevelDisplayName.Fatal, message, replacements);
  }

  public info(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Info)) {
      return;
    }
    return this.write(LevelDisplayName.Info, message, replacements);
  }

  public trace(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Trace)) {
      return;
    }
    return this.write(LevelDisplayName.Trace, message, replacements);
  }

  public warn(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Warn)) {
      return;
    }
    return this.write(LevelDisplayName.Warn, message, replacements);
  }

  protected canLog(messageLevel: Level): boolean {
    return this.level >= messageLevel;
  }

  protected abstract write(...messages: unknown[]): unknown;
}
