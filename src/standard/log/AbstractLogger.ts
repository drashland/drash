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
import { Logger } from "./Logger.ts";
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
abstract class AbstractLogger implements Logger {
  static Level = Level;

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

  /**
   * Can this logger log the given message level?
   * @param messageLevel The mesage level in question.
   * @returns True if yes, false if no.
   */
  protected canLog(messageLevel: Level): boolean {
    return this.level >= messageLevel;
  }

  /**
   * Get the prefix to write before the log message.
   * @param messageLevel The message's level to write as part of the prefix.
   * @returns The prefix: `[this.name] [messageLevel]`
   */
  protected getMessagePrefix(messageLevel: string): string {
    const repeatLength = 25 - this.name.length;
    const repeat = repeatLength > 0 ? ".".repeat(repeatLength) : "";
    const nameForPrefix = this.name.substring(0, 25) + repeat;

    return `[${nameForPrefix}] [${messageLevel}] `;
  }

  /**
   * @param level The message's log level.
   * @param message The message.
   * @param replacements An array of values to replace `{}` placeholders in the
   * `message`.
   * @returns
   */
  protected getFormattedMessage(
    level: string,
    message: unknown,
    replacements: unknown[],
  ): string {
    const messagePrefix = this.getMessagePrefix(level);

    if (typeof message !== "string") {
      return messagePrefix + message;
    }

    if (!replacements || !replacements.length) {
      return messagePrefix + message;
    }

    const replacedMessage = message
      .replace(/\{\}/g, "{}{remove}")
      .split("{remove}")
      .map((value, index) => {
        if (index + 1 > replacements.length) {
          return value.replace(/\{\}/, "{<UNDEFINED_MESSAGE_ARG>}");
        }

        const replacement = replacements[index];

        let cleanReplacement = `${replacement}`;

        if (Array.isArray(replacement) || typeof replacement === "object") {
          cleanReplacement = JSON.stringify(replacement);
        }

        return value.replace(/\{\}/, cleanReplacement);
      })
      .join("");

    return messagePrefix + replacedMessage;
  }

  protected abstract write(...messages: unknown[]): unknown;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractLogger };
