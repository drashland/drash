import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import Image from "next/image";
import { DrashFooter } from "../components/footer";
// Pulls in Tailwind, then nextra-theme-docs/style.css, then this site's own
// overrides — in that order. See the comment at the top of the file.
import "./globals.css";

export const metadata = {
  title: {
    default: "Drash",
    template: "%s — Drash",
  },
  description:
    "A strongly typed, runtime-agnostic web framework for building structured HTTP services in JavaScript, built on Web Standards.",
};

const logo = (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
    <Image
      src="/drash-round-250.png"
      alt=""
      width={40}
      height={40}
      // The source is 250x250. Cap the rendered box at 40px and let it scale
      // down on narrow viewports rather than crowding the nav.
      style={{ maxWidth: "40px", maxHeight: "40px", height: "auto" }}
      priority
    />
    <b>Drash</b>
  </span>
);

const navbar = (
  <Navbar
    logo={logo}
    projectLink="https://github.com/drashland/drash"
  />
);

const footer = (
  <Footer>
    <DrashFooter />
  </Footer>
);

const banner = (
  <Banner storageKey="drash-v3-unstable">
    Drash v3 is in beta. APIs may change.
  </Banner>
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/drashland/drash/tree/main/docs"
          // Level 1 (the top-level sections) stays expanded; collapsing starts
          // at level 2, which is the only depth that still toggles. See
          // app/globals.css for the rules that drop the level-1 toggle.
          sidebar={{ defaultMenuCollapseLevel: 2 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
