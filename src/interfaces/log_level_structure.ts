/**
 * @memberof Drash.Interfaces
 * @interface LogLevelStructure
 *
 * @description
 *     name: The name of the log level (e.g., "debug").
 *
 *     rank: The rank of the log level. See the
 *     Drash.Dictionaries.LogLevels.LogLevel enum member to see the ranking
 *     structure of the log levels.
 */
export interface LogLevelStructure {
  name: string;
  rank: number;
}
