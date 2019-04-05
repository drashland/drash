/// @doc-blocks-to-json members-only

interface LogLevelStructure {
  name: string;
  rank: number;
}

/**
 * @description
 *     The log levels which are organized by rank in ascending order.
 *
 * @enum LogLevel
 */
export enum LogLevel {
  Off,
  Fatal,
  Error,
  Warn,
  Info,
  Debug,
  Trace,
  All
}

/**
 * @memberof Drash.Dictionaries
 */
export const LogLevels = new Map<string, LogLevelStructure>([
  ["off",   {name: "Off",   rank: LogLevel.Off}],
  ["fatal", {name: "Fatal", rank: LogLevel.Fatal}],
  ["error", {name: "Error", rank: LogLevel.Error}],
  ["warn",  {name: "Warn",  rank: LogLevel.Warn}],
  ["info",  {name: "Info",  rank: LogLevel.Info}],
  ["debug", {name: "Debug", rank: LogLevel.Debug}],
  ["trace", {name: "Trace", rank: LogLevel.Trace}],
  ["all",   {name: "All",   rank: LogLevel.All}]
]);

export default LogLevels;
