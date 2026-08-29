#!/usr/bin/env node
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

// Imports > Modules
import { buildPathsObject, getOperations } from "../src/modules/openapiv3.ts";
import type { PathsObject, ResourceClass } from "../src/modules/openapiv3.ts";

const USAGE = `
drash-openapi - build an OpenAPI v3 document from your resource files

USAGE
  drash-openapi <path...> [options]

  Each <path> is a resource file, or a directory to search for one. Directories
  are walked recursively. Shell globs work, because the shell expands them
  before this runs:

    drash-openapi src/resources/*.js

OPTIONS
  -o, --out <path>        Write to this file. Defaults to stdout.
      --title <string>    info.title. Default: "API".
      --api-version <s>   info.version. Default: "1.0.0".
      --description <s>   info.description.
      --server <url>      Add a server. Repeat for more than one.
      --openapi <string>  OpenAPI version. Default: "3.0.3".
      --indent <number>   JSON indent. Default: 2. Use 0 for one line.
  -h, --help              Show this.

NOTES
  Resource files are imported, not parsed, so the decorators run and the
  document reflects what your code actually declares. Anything a module does at
  import time therefore happens here too -- keep server startup behind a guard.

  Point this at COMPILED JavaScript. Decorators are syntax, not types, so
  Node cannot parse a file still containing "@OpenAPIv3(...)" -- and its type
  stripping does not help, because stripping types leaves the decorator behind.
  Build your resources first (tsc, tsup, esbuild) and run this on the output.
`;

/**
 * The subset of the OpenAPI Info Object this builds.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#info-object}
 */
type InfoObject = {
  title: string;
  version: string;
  description?: string;
};

/**
 * The document written out. Only the members this can derive or be told.
 */
type Document = {
  openapi: string;
  info: InfoObject;
  servers?: { url: string }[];
  paths: PathsObject;
};

/**
 * Everything the CLI needs, after the arguments have been read.
 */
type Options = {
  paths: string[];
  out?: string;
  title: string;
  apiVersion: string;
  description?: string;
  servers: string[];
  openapi: string;
  indent: number;
};

/**
 * Extensions worth importing. A resource file is JavaScript or TypeScript, and
 * anything else in a directory being walked is not one.
 *
 * Declaration files are excluded: importing a `.d.ts` yields no runtime value,
 * so it can only ever contribute nothing or throw.
 */
const importable = [".js", ".mjs", ".cjs", ".ts", ".mts", ".cts"];

/**
 * Read the command line.
 *
 * @param argv The arguments, without the node binary or the script path.
 * @returns The options, or `undefined` when usage was requested.
 */
function parse(argv: string[]): Options | undefined {
  const options: Options = {
    paths: [],
    title: "API",
    apiVersion: "1.0.0",
    servers: [],
    openapi: "3.0.3",
    indent: 2,
  };

  // Hand-rolled rather than `node:util`'s `parseArgs`, which is still marked
  // experimental on the Node versions in `engines` and prints a warning on
  // some of them.
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    const value = () => {
      const next = argv[++i];
      if (next === undefined || next.startsWith("-")) {
        throw new Error(`${arg} needs a value.`);
      }
      return next;
    };

    switch (arg) {
      case "-h":
      case "--help":
        return undefined;
      case "-o":
      case "--out":
        options.out = value();
        break;
      case "--title":
        options.title = value();
        break;
      case "--api-version":
        options.apiVersion = value();
        break;
      case "--description":
        options.description = value();
        break;
      case "--server":
        options.servers.push(value());
        break;
      case "--openapi":
        options.openapi = value();
        break;
      case "--indent": {
        const indent = Number(value());
        if (!Number.isInteger(indent) || indent < 0) {
          throw new Error(`--indent needs a whole number, got "${argv[i]}".`);
        }
        options.indent = indent;
        break;
      }
      default:
        if (arg.startsWith("-")) {
          throw new Error(`Unknown option "${arg}".`);
        }
        options.paths.push(arg);
    }
  }

  if (options.paths.length === 0) {
    throw new Error("No paths given. Pass a resource file or a directory.");
  }

  return options;
}

/**
 * Expand the given paths into the files worth importing.
 *
 * @param paths Files and directories, as given on the command line.
 * @returns Absolute paths to the files found, in a stable order.
 */
async function collectFiles(paths: string[]): Promise<string[]> {
  const { readdir, stat } = await import("node:fs/promises");
  const { extname, join, resolve } = await import("node:path");

  const files: string[] = [];

  const walk = async (path: string): Promise<void> => {
    const info = await stat(path);

    if (info.isFile()) {
      // A file named on the command line is imported whatever it is called.
      // Only directory contents get filtered, since nothing there was chosen.
      files.push(path);
      return;
    }

    if (!info.isDirectory()) {
      return;
    }

    for (const entry of (await readdir(path, { withFileTypes: true }))) {
      const child = join(path, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) {
          continue;
        }
        await walk(child);
        continue;
      }

      if (entry.name.endsWith(".d.ts")) {
        continue;
      }

      if (importable.includes(extname(entry.name))) {
        files.push(child);
      }
    }
  };

  for (const path of paths) {
    await walk(resolve(path));
  }

  return [...new Set(files)].sort();
}

/**
 * Import each file and collect the resource classes that carry an operation.
 *
 * Only decorated classes are returned. {@link buildPathsObject} constructs
 * what it is given in order to read `paths`, so handing it every export would
 * mean constructing unrelated classes for nothing.
 *
 * @param files Absolute paths to import.
 * @returns The decorated resource classes found, in file order.
 */
async function collectResources(files: string[]): Promise<ResourceClass[]> {
  const { pathToFileURL } = await import("node:url");

  const resources: ResourceClass[] = [];

  for (const file of files) {
    let module: Record<string, unknown>;

    try {
      module = await import(pathToFileURL(file).href) as Record<
        string,
        unknown
      >;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not import ${file}\n  ${message}`);
    }

    for (const exported of Object.values(module)) {
      if (typeof exported !== "function" || !exported.prototype) {
        continue;
      }

      const resource = exported as ResourceClass;

      if (Object.keys(getOperations(resource)).length > 0) {
        resources.push(resource);
      }
    }
  }

  return resources;
}

/**
 * Build the document.
 *
 * @param options The options read from the command line.
 * @returns The document, ready to serialise.
 */
async function build(options: Options): Promise<Document> {
  const files = await collectFiles(options.paths);

  if (files.length === 0) {
    throw new Error("No JavaScript or TypeScript files found in those paths.");
  }

  const resources = await collectResources(files);

  if (resources.length === 0) {
    throw new Error(
      `No resources with @OpenAPIv3 decorators found in ${files.length} file(s).`,
    );
  }

  const document: Document = {
    openapi: options.openapi,
    info: {
      title: options.title,
      version: options.apiVersion,
    },
    paths: buildPathsObject(resources),
  };

  if (options.description) {
    document.info.description = options.description;
  }

  if (options.servers.length > 0) {
    document.servers = options.servers.map((url) => ({ url }));
  }

  return document;
}

/**
 * Run the CLI.
 *
 * @param argv The arguments, without the node binary or the script path.
 * @returns The process exit code.
 */
async function main(argv: string[]): Promise<number> {
  let options: Options | undefined;

  try {
    options = parse(argv);
  } catch (error) {
    console.error(`drash-openapi: ${(error as Error).message}`);
    console.error(`\nRun with --help for usage.`);
    return 1;
  }

  if (!options) {
    console.log(USAGE.trim());
    return 0;
  }

  let document: Document;

  try {
    document = await build(options);
  } catch (error) {
    console.error(`drash-openapi: ${(error as Error).message}`);
    return 1;
  }

  const json = JSON.stringify(document, null, options.indent);

  if (!options.out) {
    console.log(json);
    return 0;
  }

  const { writeFile, mkdir } = await import("node:fs/promises");
  const { dirname } = await import("node:path");

  await mkdir(dirname(options.out), { recursive: true });
  // A trailing newline, so the file is well-formed for anything reading it
  // line by line and does not show up as "no newline at end of file" in a diff.
  await writeFile(options.out, `${json}\n`);

  const count = Object.keys(document.paths).length;
  console.error(`drash-openapi: wrote ${count} path(s) to ${options.out}`);

  return 0;
}

const process = globalThis.process;

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(`drash-openapi: ${(error as Error).message}`);
    process.exitCode = 1;
  });
