// Newest release first, so the sidebar reads top-down in reverse chronological
// order the way a changelog does.
//
// Adding a release:
//   1. Create `about/releases/vX-Y-Z.mdx` — dashes, not dots, so the route has
//      no dots in a path segment.
//   2. Add it to the top of this file, below `index`, labelled `vX.Y.Z`.
//   3. Add a row to the table in `about/releases/index.mdx`.
//
// `index` stays pinned first regardless: a folder route with no page 404s when
// the breadcrumb resolves to /about/releases.
export default {
  index: "All Releases",
  "v3-0-0": "v3.0.0",
};
