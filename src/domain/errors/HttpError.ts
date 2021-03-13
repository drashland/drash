/*
 * MIT License
 *
 * Copyright (c) 2019-2021 Drash Land
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Status, STATUS_TEXT } from "../../../deps.ts";

/**
 * A custom class to represent a Http Error
 *
 *     try {
 *     } catch (error) {
 *       if (error instanceof HttpError) {
 *         // Handle error as HttpError
 *       }
 *     }
 *
 * @class
 * @since 2.0.0
 */
export class HttpError extends Error {
  /**
   * A property to hold the HTTP response code associated with this exception
   *
   * @since 2.0.0
   */
  public status: number;

  /**
   * @param {number} status - The status code for this error
   * @param {string} [message] - The custom message for this error
   *
   * @since 2.0.0
   */
  public constructor(status: Status, message?: string) {
    super(message || STATUS_TEXT.get(status));
    this.status = status;
    this.name = "HttpError";
  }
}
