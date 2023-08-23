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

// Imports > Core
import { AbstractLogger } from "./AbstractLogger.ts";
import { Level } from "./Level.ts";
import type { Logger } from "./Logger.ts";

interface LogGroup extends Logger {
  logger(name: string): LogGroup;
}

type LogGroupOptions = {
  prefixes?: {
    maxLoggerNameLength?: number;
  };
  // tags?: unknown[];
};

abstract class AbstractLogGroup extends AbstractLogger implements LogGroup {
  protected readonly options: LogGroupOptions = {
    prefixes: {
      maxLoggerNameLength: 25,
    },
    // tags: [],
  };

  /**
   * @param name The name of this logger to be used as a prefix to log messages.
   * @param level (optional) The highest level this logger can log. Defaults to
   * {@link Level.Debug}.
   * @param options (optional) Options to control this logger's behavior.
   */
  constructor(
    name: string,
    level: Level = Level.Off,
    options: LogGroupOptions = {},
  ) {
    super(name, level);
    this.name = name;

    this.level = level || Level.Off;

    this.options = {
      ...this.options,
      prefixes: {
        ...this.options.prefixes,
        ...(options.prefixes ?? {}),
      },
      // tags: {
      //   ...[
      //     ...(this.options.tags || []),
      //     ...(options.tags ?? []),
      //   ],
      // },
    };
  }

  /**
   * Create a nested logger under this logger.
   * @param name The name of the nested logger.
   * @returns A `AbstractLogGroup` with a prefixed name. The prefix is this
   * `AbstractLogGroup`'s name.
   */
  abstract logger(name: string): LogGroup;

  /**
   * Get the prefix to write before the log message.
   * @param messageLevel The message's level to write as part of the prefix.
   * @returns The prefix: `[this.name] [messageLevel]`
   */
  protected getMessagePrefix(messageLevel: string): string {
    const maxLoggerNameLength = this.options?.prefixes?.maxLoggerNameLength ??
      25;
    const repeatLength = maxLoggerNameLength - this.name.length;
    const repeat = repeatLength > 0 ? ".".repeat(repeatLength) : "";
    const nameForPrefix = this.name.substring(0, maxLoggerNameLength) + repeat;

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
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractLogGroup, type LogGroup, type LogGroupOptions };
