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
import { Resource } from "../../core/http/Resource.ts";

class ResourceProxy extends Resource {
  public paths: string[] = [];
  protected original_instance?: Resource;

  public setOriginal(originalInstance: Resource) {
    this.paths = originalInstance.paths;
    this.original_instance = originalInstance;
    return this.original_instance;
  }

  public CONNECT(request: unknown): unknown {
    return this.original_instance?.CONNECT(request);
  }

  public DELETE(request: unknown): unknown {
    return this.original_instance?.DELETE(request);
  }

  public GET(request: unknown): unknown {
    return this.original_instance?.GET(request);
  }

  public HEAD(request: unknown): unknown {
    return this.original_instance?.HEAD(request);
  }

  public OPTIONS(request: unknown): unknown {
    return this.original_instance?.OPTIONS(request);
  }

  public PATCH(request: unknown): unknown {
    return this.original_instance?.PATCH(request);
  }

  public POST(request: unknown): unknown {
    return this.original_instance?.POST(request);
  }

  public PUT(request: unknown): unknown {
    return this.original_instance?.PUT(request);
  }

  public TRACE(request: unknown): unknown {
    return this.original_instance?.TRACE(request);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { ResourceProxy };
