"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCodeRegistry = void 0;
/**
 * Key-value store of response status codes with their status texts.
 * @returns Key-value store of response status codes and their status texts.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
exports.StatusCodeRegistry = new Map([
  [100, { value: 100, description: "Continue" }],
  [101, { value: 101, description: "Switching Protocols" }],
  [102, { value: 102, description: "Processing" }],
  [103, { value: 103, description: "Early Hints" }],
  [200, { value: 200, description: "OK" }],
  [201, { value: 201, description: "Created" }],
  [202, { value: 202, description: "Accepted" }],
  [203, { value: 203, description: "Non Authoritative Info" }],
  [204, { value: 204, description: "No Content" }],
  [205, { value: 205, description: "Reset Content" }],
  [206, { value: 206, description: "Partial Content" }],
  [207, { value: 207, description: "Multi Status" }],
  [208, { value: 208, description: "Already Reported" }],
  [226, { value: 226, description: "IM Used" }],
  [300, { value: 300, description: "Multiple Choices" }],
  [301, { value: 301, description: "Moved Permanently" }],
  [302, { value: 302, description: "Found" }],
  [303, { value: 303, description: "See Other" }],
  [304, { value: 304, description: "Not Modified" }],
  [305, { value: 305, description: "Use Proxy" }],
  [307, { value: 307, description: "Temporary Redirect" }],
  [308, { value: 308, description: "Permanent Redirect" }],
  [400, { value: 400, description: "Bad Request" }],
  [401, { value: 401, description: "Unauthorized" }],
  [402, { value: 402, description: "Payment Required" }],
  [403, { value: 403, description: "Forbidden" }],
  [404, { value: 404, description: "Not Found" }],
  [405, { value: 405, description: "Method Not Allowed" }],
  [406, { value: 406, description: "Not Acceptable" }],
  [407, { value: 407, description: "Proxy Auth Required" }],
  [408, { value: 408, description: "Request Timeout" }],
  [409, { value: 409, description: "Conflict" }],
  [410, { value: 410, description: "Gone" }],
  [411, { value: 411, description: "Length Required" }],
  [412, { value: 412, description: "Precondition Failed" }],
  [413, { value: 413, description: "Request Entity Too Large" }],
  [414, { value: 414, description: "Request URI Too Long" }],
  [415, { value: 415, description: "Unsupported Media Type" }],
  [416, { value: 416, description: "Requested Range Not Satisfiable" }],
  [417, { value: 417, description: "Expectation Failed" }],
  [418, { value: 418, description: "I'm a teapot" }],
  [421, { value: 421, description: "Misdirected Request" }],
  [422, { value: 422, description: "Unprocessable Entity" }],
  [423, { value: 423, description: "Locked" }],
  [424, { value: 424, description: "Failed Dependency" }],
  [425, { value: 425, description: "Too Early" }],
  [426, { value: 426, description: "Upgrade Required" }],
  [428, { value: 428, description: "Precondition Required" }],
  [429, { value: 429, description: "Too Many Requests" }],
  [431, { value: 431, description: "Request Header Fields Too Large" }],
  [451, { value: 451, description: "Unavailable For Legal Reasons" }],
  [500, { value: 500, description: "Internal Server Error" }],
  [501, { value: 501, description: "Not Implemented" }],
  [502, { value: 502, description: "Bad Gateway" }],
  [503, { value: 503, description: "Service Unavailable" }],
  [504, { value: 504, description: "Gateway Timeout" }],
  [505, { value: 505, description: "HTTP Version Not Supported" }],
  [506, { value: 506, description: "Variant Also Negotiates" }],
  [507, { value: 507, description: "Insufficient Storage" }],
  [508, { value: 508, description: "Loop Detected" }],
  [510, { value: 510, description: "Not Extended" }],
  [511, { value: 511, description: "Network Authentication Required" }],
]);
//# sourceMappingURL=status_code_registry.js.map
