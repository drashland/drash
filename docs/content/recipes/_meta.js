export default {
  // Must stay first and present. The "Recipes" crumb resolves to the first
  // entry here, so a folder route with no page would 404.
  index: "Overview",
  // Not alphabetical, deliberately: teams pick a runtime and stay there, so
  // Runtimes is what nearly every reader wants. Frameworks and Platforms sit
  // after it, alphabetically between themselves, because each answers a
  // narrower question — what owns the entry point, and what you deploy onto.
  // Alphabetical by label still holds inside all three.
  runtimes: "Runtimes",
  frameworks: "Frameworks",
  platforms: "Platforms",
};
