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

import * as Interfaces from "../../../src/core/Interfaces.ts";
import { Jae } from "./jae.ts";

interface IOptions {
  // deno-lint-ignore camelcase
  views_path: string;
}

export class TengineService implements Interfaces.Service {
  readonly #options: IOptions;
  #template_engine: Jae;

  constructor(options: IOptions) {
    this.#options = options;
    this.#template_engine = new Jae(this.#options.views_path);
  }

  runAfterResource(_request: Request, response: Response) {
    response.headers.set("Content-Type", "text/html");
  }

  render<T extends unknown>(filepath: string, data: T): string {
    return this.#template_engine.render(filepath, data);
  }
}
