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

import * as asserts from "@std/assert";
import { URLPatternPolyfill } from "../../../../src/standard/polyfill/URLPatternPolyfill.ts";

// The resource index appends `{/}?` to every path, so the tests do too.
const compile = (path: string) => ({ pathname: path + "{/}?" });

const exec = (path: string, url: string) =>
  new URLPatternPolyfill(compile(path))
    .exec("http://localhost" + url)?.pathname?.groups ?? null;

const paths = [
  "/",
  "/users",
  "/favicon.ico",
  "/files/:name.json",
  "/q/:id(\\d+)",
  "/assets/*",
  "/m/:a-:b",
  "/users/:id?",
  "/users/:id/:name?/:age?/:city?",
  "/([0-9]$)",
  "/a/(\\d+)/:b",
  "/x/:p*",
  "/x/:p+",
  "/:id(\\d+)?",
  "/*.js",
  "/files/*/:n",
  "/{foo}?bar",
  "/café",
  "/a b",
  "/users/{id}",
  "/a{/:x}*",
  "/a{/:x}+",
  "/:x(.*)",
  "/f\\:x",
  "/:x",
];

const urls = [
  "/",
  "//users",
  "/users",
  "/users/",
  "/users/1",
  "/users/1/bob",
  "/users/1/bob/30/nyc",
  "/users/1/bob/30/nyc/x",
  "/favicon.ico",
  "/faviconXico",
  "/files/report.json",
  "/files/report.txt",
  "/q/1",
  "/q/12",
  "/q/abc9",
  "/assets",
  "/assets/app.js",
  "/assets/a/b.js",
  "/m/x-y",
  "/m/x-y-z",
  "/5",
  "/55",
  "/x",
  "/x/a",
  "/x/a/b",
  "/a/12/z",
  "/a.js",
  "/b/c.js",
  "/files/a/b/n1",
  "/bar",
  "/foobar",
  "/café",
  "/a%20b",
  "/users/id",
  "/users/5",
  "/a",
  "/a/1/2",
  "/f:x",
  "/%E2%82%AC",
];

Deno.test("URLPatternPolyfill", async (t) => {
  await t.step("matches what the native URLPattern matches", async (t) => {
    for (const path of paths) {
      await t.step(path, () => {
        const native = new URLPattern(compile(path));
        for (const url of urls) {
          asserts.assertEquals(
            exec(path, url),
            native.exec("http://localhost" + url)?.pathname.groups ?? null,
            `${path} against ${url}`,
          );
        }
      });
    }
  });

  await t.step("matches `.` literally", () => {
    asserts.assertEquals(exec("/favicon.ico", "/favicon.ico"), {});
    asserts.assertEquals(exec("/favicon.ico", "/faviconXico"), null);
  });

  await t.step("ends a param name at a non-identifier character", () => {
    asserts.assertEquals(exec("/files/:name.json", "/files/report.json"), {
      name: "report",
    });
    asserts.assertEquals(exec("/files/:name.json", "/files/report.txt"), null);
    asserts.assertEquals(exec("/m/:a-:b", "/m/x-y"), { a: "x", b: "y" });
  });

  await t.step("constrains a param to its regexp", () => {
    asserts.assertEquals(exec("/q/:id(\\d+)", "/q/1"), { id: "1" });
    asserts.assertEquals(exec("/q/:id(\\d+)", "/q/12"), { id: "12" });
    asserts.assertEquals(exec("/q/:id(\\d+)", "/q/abc9"), null);
  });

  await t.step("matches subpaths with `*`", () => {
    asserts.assertEquals(exec("/assets/*", "/assets/app.js"), {
      0: "app.js",
    });
    asserts.assertEquals(exec("/assets/*", "/assets/a/b.js"), {
      0: "a/b.js",
    });
  });

  await t.step("does not match a doubled leading slash", () => {
    asserts.assertEquals(exec("/users", "//users"), null);
  });

  await t.step("leaves unmatched optional params undefined", () => {
    asserts.assertEquals(exec("/users/:id/:name?", "/users/1"), {
      id: "1",
      name: undefined,
    });
  });

  await t.step("throws on the patterns the native URLPattern rejects", () => {
    for (const path of ["/:", "/(", "/()", "/(a(b))", "/(?x)", "/{a", "/a\\"]) {
      asserts.assertThrows(() => new URLPatternPolyfill({ pathname: path }));
    }
    asserts.assertThrows(
      () => new URLPatternPolyfill({ pathname: "/:a/:a" }),
      TypeError,
      "used more than once",
    );
  });

  await t.step("strips the trailing-slash suffix from `pathname`", () => {
    asserts.assertEquals(
      new URLPatternPolyfill(compile("/users/:id")).pathname,
      "/users/:id",
    );
  });
});
