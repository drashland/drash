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
import { AbstractHandler } from "../../core/handlers/AbstractHandler.ts";
import type { IHandler } from "../../core/interfaces/IHandler.ts";

/**
 * The minimal amount of data the `RequestChain` needs to process HTTP requests.
 */
type InputRequest = {
  /** The requests' URL (e.g., `"http://localhost:1447/hello"`) */
  url: string;
  /** The requests' HTTP method (e.g., `"GET"`) */
  method: string;
};

/**
 * Base handler for all request handlers so each can share the same interface.
 */
abstract class AbstractRequestHandler<
  I extends InputRequest,
  O,
> extends AbstractHandler {
  public handle(input: I): Promise<O> {
    if (this.next_handler) {
      return (this.next_handler as IHandler<I, Promise<O>>).handle(input);
    }

    throw new Error("Request could not be processed further");
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractRequestHandler, type InputRequest };
