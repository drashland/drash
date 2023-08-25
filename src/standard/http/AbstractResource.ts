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
import type { ResourceClass } from "../../core/types/ResourceClass.ts";
import { IResource } from "../../core/interfaces/IResource.ts";

// Imports > Standard
import { HTTPResponse } from "./HTTPResponse.ts";
import { StatusCode } from "./response/StatusCode.ts";
import { type Builder, ResourceGroup } from "./ResourceGroup.ts";

type ResourceClasses = (ResourceClass | ResourceClass[])[];

/**
 * A base class with a resource group builder.
 */
abstract class AbstractResource implements IResource {
  /**
   * Instantiate a {@link Builder} with the given `resources`.
   * @param resources The resource classes to group together.
   * @returns A {@link Builder}.
   */
  static group(
    ...resources: ResourceClasses
  ): Omit<Builder, "resources"> {
    return ResourceGroup.builder().resources(...resources);
  }

  abstract paths: string[];

  public CONNECT(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }

  public DELETE(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }

  public GET(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }

  public HEAD(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }

  public OPTIONS(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }

  public PATCH(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }

  public POST(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }

  public PUT(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }

  public TRACE(_input: unknown): unknown {
    throw HTTPResponse.error(StatusCode.NotImplemented);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AbstractResource };
