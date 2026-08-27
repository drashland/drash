/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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

/**
 * The interface the resource index needs from a `URLPattern`, so an alternative
 * implementation can be supplied.
 *
 * @module
 */

type ExecResult = {
  pathname?: {
    groups: Record<string, string | undefined>;
  };
};

/**
 * The shape an alternative `URLPattern` has to provide.
 *
 * Extend this to supply your own matcher to `ResourcesIndex` instead of the
 * runtime's global or Drash's polyfill.
 */
class CustomUrlPattern {
  /**
   * Match a URL against this pattern.
   *
   * @param _url The URL to match.
   * @returns The matched path params, or `null` if it does not match.
   */
  exec(_url: string): ExecResult | null {
    return null;
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { CustomUrlPattern, type ExecResult };
