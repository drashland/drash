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
import { StatusCode } from "../../core/http/response/StatusCode.ts";
import type { IResource } from "../../core/interfaces/IResource.ts";

/**
 * The base resource class for all resources.
 */
class Resource implements IResource {
  public paths: string[] = [];

  public CONNECT(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }

  public DELETE(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }

  public GET(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }

  public HEAD(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }

  public OPTIONS(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }

  public PATCH(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }

  public POST(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }

  public PUT(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }

  public TRACE(_input: unknown): unknown {
    throw new HTTPError(StatusCode.NotImplemented);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { Resource };
