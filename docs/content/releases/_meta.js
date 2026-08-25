// Newest release first, so the sidebar reads top-down in reverse chronological
// order the way a changelog does.
//
// Adding a release:
//   1. Create `releases/vX-Y-Z.mdx` — dashes, not dots, so the route has no
//      dots in a path segment.
//   2. Add it to the top of this file, below `index`, labelled `vX.Y.Z`.
//   3. Add a row to the table in `releases/index.mdx`.
//
// `index` stays pinned first regardless: "Releases" is a top-bar entry, so its
// breadcrumb resolves to /releases, and a folder route with no page 404s.
export default {
  index: "All Releases",
  "v3-0-0": "v3.0.0",
};
