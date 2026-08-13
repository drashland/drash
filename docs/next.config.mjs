import nextra from "nextra";

// The site is served from the root. If it is ever hosted under a subpath (for
// example a GitHub *project* page at drashland.github.io/drash), set
// DOCS_BASE_PATH to that prefix so assets and routes resolve.
const basePath = process.env.DOCS_BASE_PATH ?? "";

const withNextra = nextra({
  defaultShowCopyCode: true,
});

export default withNextra({
  // GitHub Pages serves static files; there is no Node server to render on.
  output: "export",
  basePath,
  // next/image's default loader needs a running server.
  images: {
    unoptimized: true,
  },
  // Pages serves /foo as /foo/index.html.
  trailingSlash: true,
  turbopack: {
    // The repo root holds its own pnpm-lock.yaml for the framework, so Next
    // infers the wrong workspace root without this.
    root: import.meta.dirname,
    // Nextra compiles every MDX file to import its component map from the
    // virtual module `next-mdx-import-source-file`. Turbopack needs to be told
    // what that resolves to; without the alias the map can come back empty and
    // MDX renders undefined components.
    resolveAlias: {
      "next-mdx-import-source-file": "./mdx-components.js",
    },
  },
  // Next writes AGENTS.md/CLAUDE.md into this directory on every dev run.
  // The docs package does not need its own agent instructions.
  agentRules: false,
});
