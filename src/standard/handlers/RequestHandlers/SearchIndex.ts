import { ConsoleLogger, Level } from "../../log/ConsoleLogger.ts";
import { Logger } from "../../log/Logger.ts";
import { Handler } from "../Handler.ts";

abstract class SearchIndex<SearchResult> extends Handler<SearchResult> {
  constructor() {
    super();
  }

  protected abstract buildIndex(items: unknown): void;

  protected abstract search(input: unknown): SearchResult;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { SearchIndex };
