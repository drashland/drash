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

/*
 * This file has the purpose of auto creating a TypeScript Map for the available
 * web mime types. The way we create it is by relying on extentions, for
 * example, a json extention will have a corresponding application/json mime.
 *
 * For now we are ignoring all mime types that are not associated with an
 * extention.
 */

const response = await fetch(
  "https://cdn.jsdelivr.net/gh/jshttp/mime-db@master/db.json",
);
const data = await response.json();

let output = `// This file was generated at ${new Date().toISOString()}\n`;
output += `export const MimeTypes = new Map<string, string>([`;
const mimeTypes = new Map<string, string>();
for (const key in data) {
  if (!Object.prototype.hasOwnProperty.call(data, key)) {
    continue;
  }
  const element = data[key];
  if (!element.source) {
    continue;
  }
  if (!element.extensions) {
    continue;
  }
  for (const extension of element.extensions) {
    output += `\n`;
    mimeTypes.set(extension, key);
    output += `  ["${extension}", "${key}"],`;
  }
}
output += `\n]);`;
Deno.writeFile(
  `${Deno.cwd()}/src/domain/entities/MimeTypes.ts`,
  new TextEncoder().encode(output),
);
