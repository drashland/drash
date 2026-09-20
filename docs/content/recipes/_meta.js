export default {
  // Must stay first and present. The "Recipes" crumb resolves to the first
  // entry here, so a folder route with no page would 404.
  index: "Overview",
  // Everything below is sorted alphabetically by label — the text in the
  // sidebar, not the key. New recipes get inserted in order, never appended.
  //
  // Every entry is a folder. A folder with no `index` page is a collapsible
  // group rather than a route of its own, which is what keeps "Bun" from
  // being a page that only says "pick one of these."
  ai: "AI",
  bun: "Bun",
  "cloudflare-workers": "Cloudflare Workers",
  deno: "Deno",
  // Its own section rather than a page under each runtime: the protocol is
  // the subject, and the four builds differ only in server glue. The runtime
  // sections still list an "MCP Server" entry, pointing here.
  "model-context-protocol": "Model Context Protocol (MCP)",
  node: "Node",
  vercel: "Vercel",
};
