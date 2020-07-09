/**
 * Contains the type of LogLevelStructure
 * @remarks
 * name: string
 *
 *     The name of the log level (e.g., "debug").
 *
 * rank: number
 *
 *     The rank of the log level. See the
 *     Drash.Dictionaries.LogLevels.LogLevel enum member to see the ranking
 *     structure of the log levels.
 */
export interface LogLevelStructure {
  name: string;
  rank: number;
}
