/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
 * Copyright (C) 2022  Drash authors. The Drash authors are listed in the
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
import { ChainHandler } from "./chain_handler.js";
import { Method as HTTPMethod } from "../../enums.js";
import { ServicesHandler } from "../services_handler.js";
import * as Interfaces from "../../interfaces.js";
import * as Types from "../../types.js";
/**
 * Class that handles requests that have made it to an existing resource. This
 * class ensures requests run through the chains defined by the `Resource` (see
 * `this#original`). Resource's can have multiple chains -- one for each HTTP
 * method they define; and each of those chains can have services.
 */
export declare abstract class AbstractResourceHandler<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
  GenericOriginalURLPatterns,
> extends ChainHandler<GenericRequest, GenericResponseBuilder>
  implements Interfaces.ResourceHandler<GenericResponseBuilder> {
  #private;
  protected original: Interfaces.Resource<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  >;
  protected method_chains: Record<
    HTTPMethod,
    Types.HandleMethod<
      Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
      void
    >[]
  >;
  protected services_all_handler: ServicesHandler<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  >;
  readonly original_url_patterns: GenericOriginalURLPatterns[];
  /**
   * @param ResourceClass - See {@link Resource}.
   */
  constructor(
    ResourceClass: Types.ResourceClass<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
  );
  abstract getOriginalUrlPatterns(): GenericOriginalURLPatterns[];
  handle(
    context: Types.ContextForRequest<GenericRequest, GenericResponseBuilder>,
  ): Types.Promisable<void>;
}
