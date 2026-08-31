// `index` must stay first and present. The "OpenAPI v3" breadcrumb resolves to
// the first entry here, and a folder route with no page 404s.
//
// Decorators before CLI: the decorator is what you write, the CLI is what reads
// it back, and the second only makes sense once you have the first.
export default {
  index: "Overview",
  decorators: "Decorators",
  cli: "CLI",
};
