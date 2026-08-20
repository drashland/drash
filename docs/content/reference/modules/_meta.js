export default {
  // Must stay first and present. The "Modules" breadcrumb resolves to the first
  // entry in this file, so a folder route with no page here would 404.
  index: "Overview",
  builders: "Builders",
  // src/modules holds http.native.ts and http.polyfill.ts as files, not an
  // http/ directory, so these sit here rather than in a folder.
  http: "HTTP",
  "native-vs-polyfill": "Native vs. Polyfill",
  chain: "Chain",
  middleware: "Middleware",
};
