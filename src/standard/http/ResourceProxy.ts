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

// Imports > Core
import { Promisable } from "../types/Promisable.ts";
import { Resource } from "../../core/http/Resource.ts";

abstract class ResourceProxy<Proxy, I, O> extends Resource {
  public paths: string[] = [];
  protected original: Resource & Proxy;

  constructor(original: Resource & Proxy) {
    super();
    this.paths = original.paths;
    this.original = original;
  }

  public CONNECT(request: I): Promisable<O> {
    return this.original.CONNECT(request) as Promisable<O>;
  }

  public DELETE(request: I): Promisable<O> {
    return this.original.DELETE(request) as Promisable<O>;
  }

  public GET(request: I): Promisable<O> {
    return this.original.GET(request) as Promisable<O>;
  }

  public HEAD(request: I): Promisable<O> {
    return this.original.HEAD(request) as Promisable<O>;
  }

  public OPTIONS(request: I): Promisable<O> {
    return this.original.OPTIONS(request) as Promisable<O>;
  }

  public PATCH(request: I): Promisable<O> {
    return this.original.PATCH(request) as Promisable<O>;
  }

  public POST(request: I): Promisable<O> {
    return this.original.POST(request) as Promisable<O>;
  }

  public PUT(request: I): Promisable<O> {
    return this.original.PUT(request) as Promisable<O>;
  }

  public TRACE(request: I): Promisable<O> {
    return this.original.TRACE(request) as Promisable<O>;
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { ResourceProxy };
