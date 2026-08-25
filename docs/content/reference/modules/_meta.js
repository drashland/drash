// Mirrors src/modules/. Files come first, then directories — the same order a
// reader sees running `ls` on the source.
export default {
  // Must stay first and present. The "Modules" breadcrumb resolves to the first
  // entry in this file, so a folder route with no page here would 404.
  index: "Overview",

  // src/modules holds http.native.ts, http.polyfill.ts, and openapiv3.ts as
  // files, not directories, so these are pages here rather than folders.
  "http-native": "http.native",
  "http-polyfill": "http.polyfill",
  openapiv3: "openapiv3",

  builders: "Builders",
  middleware: "Middleware",
};
