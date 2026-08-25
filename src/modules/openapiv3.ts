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

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////
//
// This public API may re-export (or relay) values exported from other modules.
// For more information on re-export/relay, see the following:
//
// https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export#re-exporting_aggregating
//

// Exports > Modules
export {
  buildPathsObject,
  getOperation,
  getOperations,
  OpenAPIv3,
} from "./decorators/OpenAPIv3.ts";

// Exports > Modules > Types
export type {
  CallbackObject,
  EncodingObject,
  ExampleObject,
  ExternalDocumentationObject,
  HeaderObject,
  LinkObject,
  MediaTypeObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  PathsObject,
  ReferenceObject,
  RequestBodyObject,
  ResourceClass,
  ResourceLike,
  ResourceMethod,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  SecurityRequirementObject,
  ServerObject,
} from "./decorators/OpenAPIv3.ts";
