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
  // `type: "page"` puts an entry in the top bar instead of the sidebar. These
  // two are links rather than pages of their own, so they carry an `href`.
  docs: {
    title: "Docs",
    type: "page",
    href: "/getting-started/introduction",
  },
  examples: {
    title: "Examples",
    type: "page",
    href: "/quickstart/examples",
  },
  "getting-started": "Getting Started",
  quickstart: "Quickstart",
  concepts: "Concepts",
  reference: "Reference",
  misc: "Misc",
};
