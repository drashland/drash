import {
  GroupConsoleLogger,
  Level,
} from "./src/standard/log/GroupConsoleLogger.ts";

export const rootLogger = GroupConsoleLogger.create("drash", Level.Trace);
