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
import { StatusCode } from "../../enums.js";
/**
 * This is the base resource class for all resources. All resource classes MUST
 * extend this base resource class to inherit functionality that Drash expects
 * and uses.
 *
 * Drash defines a resource according to the MDN (see links below).
 *
 * All extended classes will have initial HTTP methods that return a 501 Not
 * Implemented response. This is based on the RFC (see attached links).
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web - MDN definition of resource.
 * @link https://datatracker.ietf.org/doc/html/rfc7231#section-4.1 - RFC section for using 501 Not Implemented as default HTTP method response.
 */
export class AbstractResource {
  constructor() {
    this.paths = [];
    this.services = {};
  }
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  CONNECT(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
  DELETE(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
  GET(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
  HEAD(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
  OPTIONS(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
  PATCH(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
  POST(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
  PUT(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
  TRACE(_request, response) {
    return response.error(StatusCode.NotImplemented);
  }
}
//# sourceMappingURL=resource.js.map
