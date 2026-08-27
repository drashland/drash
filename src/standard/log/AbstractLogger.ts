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
 * The base for loggers: holds the level and decides whether a message at a
 * given level should be written.
 *
 * @module
 */

// Imports > Standard
import { Level } from "./Level.ts";
import type { Logger } from "./Logger.ts";
import type { LogLevel } from "./LogLevel.ts";

/**
 * Base logger for logger classes.
 */
abstract class AbstractLogger implements Logger {
  /**
   * The name of this logger. Can be used when writing messages.
   */
  protected name: string;

  /**
   * The highest level log message this logger can write.
   */
  protected level: LogLevel;

  /**
   * Create a logger that writes under the given name, up to the given level.
   *
   * @param name The name written as a prefix on every message.
   * @param level The highest level this logger writes. Anything above it is
   * dropped.
   */
  constructor(name: string, level: LogLevel) {
    this.name = name;
    this.level = level;
  }

  /**
   * Write a message at the `Debug` level.
   *
   * Does nothing if this logger's level is below `Debug`.
   *
   * @param message The message. `{}` placeholders are filled from
   * `replacements`.
   * @param replacements Values for the `{}` placeholders, in order.
   * @returns Whatever the concrete logger's `write()` returns.
   */
  public debug(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Debug)) {
      return;
    }
    return this.write("DEBUG", message, replacements);
  }

  /**
   * Write a message at the `Error` level.
   *
   * Does nothing if this logger's level is below `Error`.
   *
   * @param message The message. `{}` placeholders are filled from
   * `replacements`.
   * @param replacements Values for the `{}` placeholders, in order.
   * @returns Whatever the concrete logger's `write()` returns.
   */
  public error(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Error)) {
      return;
    }
    return this.write("ERROR", message, replacements);
  }

  /**
   * Write a message at the `Fatal` level.
   *
   * Does nothing if this logger's level is below `Fatal`.
   *
   * @param message The message. `{}` placeholders are filled from
   * `replacements`.
   * @param replacements Values for the `{}` placeholders, in order.
   * @returns Whatever the concrete logger's `write()` returns.
   */
  public fatal(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Fatal)) {
      return;
    }
    return this.write("FATAL", message, replacements);
  }

  /**
   * Write a message at the `Info` level.
   *
   * Does nothing if this logger's level is below `Info`.
   *
   * @param message The message. `{}` placeholders are filled from
   * `replacements`.
   * @param replacements Values for the `{}` placeholders, in order.
   * @returns Whatever the concrete logger's `write()` returns.
   */
  public info(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Info)) {
      return;
    }
    return this.write("INFO", message, replacements);
  }

  /**
   * Write a message at the `Trace` level.
   *
   * Does nothing if this logger's level is below `Trace`.
   *
   * @param message The message. `{}` placeholders are filled from
   * `replacements`.
   * @param replacements Values for the `{}` placeholders, in order.
   * @returns Whatever the concrete logger's `write()` returns.
   */
  public trace(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Trace)) {
      return;
    }
    return this.write("TRACE", message, replacements);
  }

  /**
   * Write a message at the `Warn` level.
   *
   * Does nothing if this logger's level is below `Warn`.
   *
   * @param message The message. `{}` placeholders are filled from
   * `replacements`.
   * @param replacements Values for the `{}` placeholders, in order.
   * @returns Whatever the concrete logger's `write()` returns.
   */
  public warn(message: unknown, ...replacements: unknown[]): unknown {
    if (!this.canLog(Level.Warn)) {
      return;
    }
    return this.write("WARN", message, replacements);
  }

  /**
   * Can this logger log the given message level?
   * @param messageLevel The message level in question.
   * @returns True if yes, false if no.
   */
  protected canLog(messageLevel: LogLevel): boolean {
    // return true;
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
   * Build the line that gets written: the prefix, then the message with its
   * placeholders filled.
   *
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

  /**
   * Write the formatted message wherever this logger sends output.
   *
   * @param messages The level, the message, and its replacements.
   * @returns Whatever the destination returns.
   */
  protected abstract write(...messages: unknown[]): unknown;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractLogger };
