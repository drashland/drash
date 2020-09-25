import type { Drash } from "../../mod.ts";

/**
 *
 * The log levels which are organized by rank in ascending order.
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
