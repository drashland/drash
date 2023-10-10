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

import { Errors } from "../../../src/core/http/errors.ts";
import * as Interfaces from "../../../src/core/Interfaces.ts";
import { createHash, v4 } from "./deps.ts";

/**
 * This allows us to pass the TS compiler, so we can add properties to a method that uses it. See `csrf` method below
 */
interface F {
  (): void;
  token: string;
}

const primaryToken = createHash("sha512");
primaryToken.update(v4.generate());
const primaryTokenString = primaryToken.toString();

type Options = {
  cookie?: boolean;
};

const defaultOptions: Options = {
  cookie: false,
};

export class CSRFService implements Interfaces.Service {
  readonly #options: Options;

  public token: string = primaryTokenString; // or const csrf = Object.assign(oldCsrf, { token: primaryToken.toString() })

  constructor(options: Options = defaultOptions) {
    this.#options = options;
  }

  runBeforeResource(request: Interfaces.NativeRequest) {
    let requestToken: string | null | undefined = "";

    if (this.#options.cookie === true) {
      requestToken = request.cookie("X-CSRF-TOKEN");
    } else {
      requestToken = request.headers.get("X-CSRF-TOKEN");
    }

    if (!requestToken) {
      throw new HTTPError(
        400,
        "No CSRF token was passed in",
      );
    }

    if (requestToken !== primaryTokenString) {
      throw new HTTPError(
        403,
        "The CSRF tokens do not match",
      );
    }
  }
}
