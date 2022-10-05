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
import * as Enums from "../../enums.js";
import * as Interfaces from "../../interfaces.js";
import * as Types from "../../types.js";
/**
 * A builder to help create/update a response object. This builder is used
 * throughout the entire request-resource-response lifecycle until the very last
 * step of the lifecycle. The last step builds the response. The result is an
 * instance of `GenericResponse`.
 * @template GenericResponse The response this builder builds.
 * @template GenericBody The response's body type (e.g, `BodyInit`).
 * @template GenericHeaders The response's headers type (e.g., `Headers`).
 */
export declare abstract class AbstractResponseBuilder<
  GenericResponse,
  GenericBody,
> implements Interfaces.ResponseBuilder<GenericResponse, GenericBody> {
  #private;
  protected current_state: {
    body?: GenericBody | string;
    error?: Error;
    headers?: Record<string, string>;
    status?: Enums.StatusCode;
    statusText?: string;
    upgrade?: GenericResponse;
  };
  get body_init(): GenericBody | string | undefined;
  get headers_init(): Record<string, string> | undefined;
  body<T extends GenericBody | string>(body: T): this;
  body<T extends GenericBody | string>(contentType: string, body: T): this;
  deleteCookies(cookies: string[]): this;
  error(statusCode: Enums.StatusCode, reason?: string): this;
  html(html: string): this;
  json<T extends Record<string, unknown> | unknown[]>(json: T): this;
  redirect(location: string): this;
  cookies(cookies: Record<string, Partial<Types.Cookie>>): this;
  headers(headers: Record<string, string>): this;
  status(status: Enums.StatusCode): this;
  text(text: string): this;
  upgrade(response: GenericResponse): this;
  xml(xml: string): this;
  get error_init(): Error;
  /**
   * Turn this object into a native `Response` object.
   *
   * @returns This object as a native `Response` object.
   */
  abstract build(): GenericResponse;
}
