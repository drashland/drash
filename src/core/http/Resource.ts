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

import { HTTPError } from "../errors/HTTPError.ts";
import { Status } from "./response/Status.ts";

/**
 * The base resource class for all resources.
 */
class Resource {
  public paths: string[] = [];

  public CONNECT(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  public DELETE(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  public GET(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  public HEAD(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  public OPTIONS(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  public PATCH(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  public POST(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  public PUT(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  public TRACE(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { Resource };
