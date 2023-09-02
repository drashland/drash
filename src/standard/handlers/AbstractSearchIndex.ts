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
import { Handler } from "./Handler.ts";

abstract class AbstractSearchIndex<
  SearchResult,
> extends Handler<unknown, SearchResult> {
  /**
   * Build the index that can be searched via `this.search(...)`.
   * @param items The items to go into the index.
   */
  protected abstract buildIndex(items?: unknown): void;

  /**
   * Search the index.
   * @param input The data containing the location information for items in the
   * index.
   * @retuns The results of the search.
   */
  protected abstract search(input: unknown): SearchResult;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractSearchIndex };
