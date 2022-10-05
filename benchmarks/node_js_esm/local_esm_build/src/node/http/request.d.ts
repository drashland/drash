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
import * as Interfaces from "../../core/interfaces.js";
/**
 * Drash's version of a `Request`. This class introduces helper methods to
 * interact with the native `Request` object (e.g., `request.readBody("json"))`.
 */
export declare class Request {
  #private;
  resource_handler?: Interfaces.ResourceHandler<any>;
  /**
   * @param originalRequest - An original, native `Request` object. This should
   * come from the runtime.
   */
  constructor(originalRequest: unknown);
  get url(): any;
  get headers(): any;
  accepts(contentType: string): boolean;
  cookie(cookie: string): string;
  end(): void;
  header(header: string): string | null;
  get end_early(): boolean;
  setResourceHandler(
    resourceHandler: Interfaces.ResourceHandler<unknown>,
  ): void;
}
