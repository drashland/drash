/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
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

import * as Interfaces from "../../../src/core/Interfaces.ts";

export class ResponseTimeService implements Interfaces.Service {
  #startTime = 0;

  #endTime = 0;

  runBeforeResource() {
    this.#startTime = new Date().getTime();
  }

  runAfterResource(_request: Interfaces.NativeRequest, response: Response) {
    this.#endTime = new Date().getTime();
    const time = (this.#endTime - this.#startTime) + "ms";

    return new Response(response.body, {
      headers: {
        "X-RESPONSE-TIME": time.toString(),
      },
    });
  }
}
