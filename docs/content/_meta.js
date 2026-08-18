export default {
  index: {
    title: "Home",
    // Kept out of the sidebar; the navbar logo is the way back to it.
    // `theme.sidebar` below only hides the sidebar *on* this page, which is a
    // separate thing from listing the page as a sidebar entry.
    display: "hidden",
    // The landing page supplies its own full-bleed layout, so drop the docs
    // chrome that would box the hero in.
    theme: {
      breadcrumb: false,
      layout: "full",
      pagination: false,
      sidebar: false,
      timestamp: false,
      toc: false,
    },
  },
  // `type: "page"` puts an entry in the top bar instead of the sidebar, and
  // each such folder gets a sidebar built only from its own children. All three
  // of these are real folders, which is what keeps their sidebars separate —
  // a top-level entry without `type: "page"` would instead show up in every
  // sidebar on the site.
  docs: {
    title: "Docs",
    type: "page",
  },
  examples: {
    title: "Examples",
    type: "page",
  },
  reference: {
    title: "Reference",
    type: "page",
  },
};
