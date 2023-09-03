import { walk } from "https://deno.land/std/fs/walk.ts";

const write = Deno.args[0] === "--write";

const fileHeader = `
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
`;

const filesRequiringHeaders: { path: string; contents: string }[] = [];

const directoriesToCheck = [
  "./src",
  "./tests",
];

const pathsToIgnore = [
  ".DS_Store",
  "node_modules",
  ".md",
  ".json",
];

for await (const directory of directoriesToCheck) {
  for await (const entry of walk(directory)) {
    check(entry);
  }
}

async function check(entry) {
  for (const ignore of pathsToIgnore) {
    if (entry.path.includes(ignore)) {
      return;
    }
  }

  if (entry.isFile) {
    const contents = await Deno.readTextFile(entry.path);
    const header = contents.includes(fileHeader.trim());
    if (!header) {
      filesRequiringHeaders.push({
        path: entry.path,
        contents,
      });
    }
  }
}

if (!filesRequiringHeaders.length) {
  console.log(`\nDone checking files. All good.`);
  Deno.exit(0);
}

console.log(`
The following files are missing the file header:

${filesRequiringHeaders.map((f) => f.path).join("\n")}

`);

if (!write) {
  Deno.exit(1);
}

console.log(`\nOption \`--write\` provided. Writing file headers.\n`);

for (const file of filesRequiringHeaders) {
  await Deno.writeTextFile(
    file.path,
    fileHeader.trim() + "\n\n" + file.contents,
  );
}

console.log(`\nDone writing files.\n`);
