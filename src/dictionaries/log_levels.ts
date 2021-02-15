/// Member: Drash.Dictionaries.LogLevels

import type { Drash } from "../../mod.ts";

/**
 * The log levels which are organized by rank in ascending order.
 *
 *   - Off - Use this to turn off logging for a specific message.
 *   - Fatal - Use this to log a fatal message.
 *   - Error - Use this to log an error message.
 *   - Warn - Use this to log a warning message.
 *   - Info - Use this to log an informative message.
 *   - Debug - Use this to log a message that helps with debugging.
 *   - Trace - Use this to log a message that helps with tracing.
 *   - All - Use this to log a message despite a logger's log level.
 */
export enum LogLevel {
  Off,
  Fatal,
  Error,
  Warn,
  Info,
  Debug,
  Trace,
  All,
}

/**
 * A dictionary of log levels used in the logger classes to properly
 * display, rank, and prioritize log messages.
 */
export const LogLevels = new Map<string, Drash.Interfaces.LogLevelStructure>([
  ["off", { name: "Off", rank: LogLevel.Off }],
  ["fatal", { name: "Fatal", rank: LogLevel.Fatal }],
  ["error", { name: "Error", rank: LogLevel.Error }],
  ["warn", { name: "Warn", rank: LogLevel.Warn }],
  ["info", { name: "Info", rank: LogLevel.Info }],
  ["debug", { name: "Debug", rank: LogLevel.Debug }],
  ["trace", { name: "Trace", rank: LogLevel.Trace }],
  ["all", { name: "All", rank: LogLevel.All }],
]);
