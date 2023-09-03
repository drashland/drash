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

import { Types } from "../../../mod.deno.ts";
import { Drash } from "./deps.ts";

export class GraphQLResource extends Drash.Resource {
  public paths = ["/graphql"];

  public GET(
    _request: Drash.Request,
    response: Drash.Response,
  ): Types.Promisable<Drash.Interfaces.ResponseBuilder> {
    // This is only defined to allow GET requests to the front-end playground.
    // Without this, Drash will throw a 501 Not Implemented error when
    // requesting to view the playground at /graphql.
    return response;
  }

  public POST(
    _request: Drash.Request,
    response: Drash.Response,
  ): Types.Promisable<Drash.Interfaces.ResponseBuilder> {
    // This is only defined so that POST requests to this resource can be
    // processed. Without this, Drash will throw a 501 Not Implemented error
    // when clients try to make GraphQL queries.
    return response;
  }
}
